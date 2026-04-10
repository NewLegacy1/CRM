"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/** One full viewport tall per beat so only the centered title is prominent */
const VIEWPORT_UNITS_PER_BEAT = 100;

/**
 * Narrow screens only: optional extra dvh after the 3 beats (scene stays on final pose).
 * Set to 0 so the hero ends right after the last beat — minimal gap before the next section.
 */
const HERO_MOBILE_TAIL_DVH = 0;

const MOBILE_BREAKPOINT_PX = 768;

/** Deterministic silhouette + star field across devices (change to reshuffle mountains/stars). */
const HERO_STAR_SEED = 0x5f3759df;
const HERO_MOUNTAIN_SEED = 0xdeadbeef;

/** iOS static hero: add `public/marketing/hero-mobile.webp` (desktop capture); if missing, WebGL runs. */
const IOS_HERO_STATIC_SRC = "/marketing/hero-mobile.webp";

/**
 * Single scene definition. Mobile skips bloom (fixes vertical streak on many phone GPUs);
 * exposure / additive layers are tuned when bloom is off.
 */
const HERO_SCENE = {
  fogDensity: 0.00025,
  toneExposure: 0.4,
  lookAtY: 10,
  baseNebulaOpacity: 0.15,
  baseAtmosphereIntensity: 0.15,
  bloomStrength: 0.5,
  nebulaFade: 0.05,
  bloomFade: 0.15,
  nebulaSegs: 100,
  atmSegs: 32,
  mountainPathSegs: 50,
  mountainHeightScale: 1,
  mountainYOffset: -20,
  bloomRadius: 0.42,
  bloomThreshold: 0.88,
  cameraPositions: [
    { x: 0, y: 30, z: 300 },
    { x: 0, y: 40, z: -50 },
    { x: 0, y: 50, z: -700 },
  ],
  mountainLayers: [
    { distance: -50, height: 60, color: 0x18181b, opacity: 1 },
    { distance: -100, height: 80, color: 0x1f1f23, opacity: 0.9 },
    { distance: -150, height: 100, color: 0x27272a, opacity: 0.7 },
    { distance: -200, height: 120, color: 0x2e2e33, opacity: 0.5 },
  ],
} as const;

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PerformanceTier {
  pixelRatioCap: number;
  starCount: number;
  starSizeScale: number;
  bloomResolutionScale: number;
  useAntialias: boolean;
  cameraFov: number;
  /** Desktop only — bloom causes vertical streak / blown highlights on many mobile GPUs */
  useBloom: boolean;
}

function isAppleTouchDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Use the shorter viewport edge so landscape phones are still "mobile" for bloom/GPU policy.
 * (Many phones are >768px wide in landscape; width-only detection kept full bloom and the streak.)
 */
function getPerformanceTier(innerWidth: number, innerHeight: number): PerformanceTier {
  const shortSide = Math.min(innerWidth, innerHeight);
  const mobile = shortSide < MOBILE_BREAKPOINT_PX;
  const appleTouch = isAppleTouchDevice();

  // Full desktop path: only non-touch or mouse-primary with a large shortest side.
  if (!mobile && !appleTouch) {
    return {
      pixelRatioCap: 2,
      starCount: 3000,
      starSizeScale: 1,
      bloomResolutionScale: 1,
      useAntialias: true,
      cameraFov: 75,
      useBloom: true,
    };
  }

  // All Safari/iOS/iPadOS WebGL: never use bloom (streak + blown highlights on Apple GPUs).
  if (appleTouch) {
    const largeTablet = shortSide >= MOBILE_BREAKPOINT_PX;
    return {
      pixelRatioCap: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, largeTablet ? 2 : 1.75),
      starCount: largeTablet ? 2800 : 2400,
      starSizeScale: 1,
      bloomResolutionScale: 1,
      useAntialias: true,
      cameraFov: largeTablet ? 70 : 64,
      useBloom: false,
    };
  }

  return {
    pixelRatioCap: 1.25,
    starCount: 2000,
    starSizeScale: 1,
    bloomResolutionScale: 0.72,
    useAntialias: false,
    cameraFov: 64,
    useBloom: false,
  };
}

function getRenderTuning(useBloom: boolean): {
  toneExposure: number;
  nebulaOpacity: number;
  atmosphereIntensity: number;
  /** Compensates missing bloom on mobile so stars read closer to desktop. */
  starBoost: number;
} {
  if (useBloom) {
    return {
      toneExposure: HERO_SCENE.toneExposure,
      nebulaOpacity: HERO_SCENE.baseNebulaOpacity,
      atmosphereIntensity: HERO_SCENE.baseAtmosphereIntensity,
      starBoost: 1,
    };
  }
  return {
    toneExposure: HERO_SCENE.toneExposure * 1.22,
    nebulaOpacity: HERO_SCENE.baseNebulaOpacity * 0.7,
    atmosphereIntensity: HERO_SCENE.baseAtmosphereIntensity * 0.62,
    starBoost: 1.48,
  };
}

function createStarPointSpriteTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const t = new THREE.CanvasTexture(canvas);
    t.needsUpdate = true;
    return t;
  }
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2 - 1);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(0.55, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function getViewportHeightForReveal(): number {
  if (typeof window === "undefined") return 800;
  return Math.round(window.visualViewport?.height ?? window.innerHeight);
}

const SECTIONS = [
  {
    title: "NEW LEGACY",
    lines: [
      "Your business’s next chapter",
      "with AI that handles the busywork while you lead, sell, and serve.",
    ],
  },
  {
    title: "BUILT FOR GROWTH",
    lines: [
      "Websites, follow-up, and day-to-day tasks wired together",
      "so leads don’t slip away and you’re not carrying it all alone.",
    ],
  },
  {
    title: "WHAT WE BUILD",
    lines: [
      "Keep scrolling — you’ll see the real work: sites, automation,",
      "and tools built for owners who want outcomes, not tech talk.",
    ],
  },
];

function initialBeatReveal(): { opacity: number; translateY: number }[] {
  if (typeof window === "undefined") {
    return SECTIONS.map(() => ({ opacity: 1, translateY: 0 }));
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return SECTIONS.map(() => ({ opacity: 1, translateY: 0 }));
  }
  return SECTIONS.map((_, i) => ({
    opacity: i === 0 ? 1 : 0,
    translateY: 0,
  }));
}

interface ThreeRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  bloomPass: UnrealBloomPass | null;
  stars: THREE.Object3D[];
  nebula: THREE.Mesh | null;
  mountains: THREE.Mesh[];
  atmosphere: THREE.Mesh | null;
  animationId: number | null;
  targetCameraX: number;
  targetCameraY: number;
  targetCameraZ: number;
  mountainOpacity: number;
  nebulaTargetOpacity: number;
  bloomTarget: number;
  useBloom: boolean;
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const smoothMountainOpacity = useRef(1);
  const smoothNebulaOpacity = useRef<number>(HERO_SCENE.baseNebulaOpacity);
  const smoothBloom = useRef<number>(HERO_SCENE.bloomStrength);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [heroInView, setHeroInView] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return Math.min(window.innerWidth, window.innerHeight) < MOBILE_BREAKPOINT_PX;
  });
  const [beatReveal, setBeatReveal] = useState(initialBeatReveal);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  /** pending = resolving iOS asset; yes = static webp; no = WebGL */
  const [iosStaticMode, setIosStaticMode] = useState<"pending" | "yes" | "no">("pending");

  const totalSections = SECTIONS.length;
  const heroTotalVh = VIEWPORT_UNITS_PER_BEAT * SECTIONS.length;

  const prefersReducedMotionRef = useRef(prefersReducedMotion);

  useLayoutEffect(() => {
    if (!isAppleTouchDevice()) {
      setIosStaticMode("no");
      return;
    }
    const img = new Image();
    img.onload = () => setIosStaticMode("yes");
    img.onerror = () => setIosStaticMode("no");
    img.src = IOS_HERO_STATIC_SRC;
  }, []);

  useLayoutEffect(() => {
    const updateMobileViewport = () => {
      setIsMobileViewport(
        Math.min(window.innerWidth, window.innerHeight) < MOBILE_BREAKPOINT_PX
      );
    };
    updateMobileViewport();
    window.addEventListener("resize", updateMobileViewport);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateMobileViewport);
    return () => {
      window.removeEventListener("resize", updateMobileViewport);
      vv?.removeEventListener("resize", updateMobileViewport);
    };
  }, []);

  useEffect(() => {
    prefersReducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    setPrefersReducedMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const threeRefs = useRef<ThreeRefs>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    bloomPass: null,
    stars: [],
    nebula: null,
    mountains: [],
    atmosphere: null,
    animationId: null,
    targetCameraX: 0,
    targetCameraY: 30,
    targetCameraZ: 300,
    mountainOpacity: 1,
    nebulaTargetOpacity: HERO_SCENE.baseNebulaOpacity,
    bloomTarget: HERO_SCENE.bloomStrength,
    useBloom: true,
  });

  useEffect(() => {
    if (iosStaticMode === "yes") {
      setIsReady(true);
      return;
    }
    if (iosStaticMode !== "no") return;
    if (!canvasRef.current) return;

    const refs = threeRefs.current;
    const canvasEl = canvasRef.current;
    let cancelled = false;
    let ro: ResizeObserver | null = null;
    let rafBoot: number | null = null;

    const tier = getPerformanceTier(window.innerWidth, window.innerHeight);
    const tuning = getRenderTuning(tier.useBloom);
    refs.useBloom = tier.useBloom;

    const runFullInit = (): (() => void) => {
      if (cancelled) return () => {};
      if (refs.renderer) return () => {};
      const w = Math.max(1, Math.floor(canvasEl.clientWidth));
      const h = Math.max(1, Math.floor(canvasEl.clientHeight));
      if (w < 2 || h < 2) return () => {};

      const initialCamera = HERO_SCENE.cameraPositions[0];

      smoothCameraPos.current = { ...initialCamera };
      smoothMountainOpacity.current = 1;
      smoothNebulaOpacity.current = tuning.nebulaOpacity;
      smoothBloom.current = tier.useBloom ? HERO_SCENE.bloomStrength : 0;
      refs.targetCameraX = initialCamera.x;
      refs.targetCameraY = initialCamera.y;
      refs.targetCameraZ = initialCamera.z;
      refs.mountainOpacity = 1;
      refs.nebulaTargetOpacity = tuning.nebulaOpacity;
      refs.bloomTarget = tier.useBloom ? HERO_SCENE.bloomStrength : 0;

      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, HERO_SCENE.fogDensity);

      const syncRendererToCanvas = () => {
        if (!refs.camera || !refs.renderer || !canvasEl || cancelled) return;
        const cw = Math.max(1, Math.floor(canvasEl.clientWidth));
        const ch = Math.max(1, Math.floor(canvasEl.clientHeight));
        if (cw < 2 || ch < 2) return;
        refs.camera.aspect = cw / ch;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier.pixelRatioCap));
        refs.renderer.setSize(cw, ch, false);
        refs.composer?.setSize(cw, ch);
        if (refs.bloomPass && tier.useBloom) {
          const bw = Math.max(2, Math.floor(cw * tier.bloomResolutionScale));
          const bh = Math.max(2, Math.floor(ch * tier.bloomResolutionScale));
          refs.bloomPass.setSize(bw, bh);
        }
      };

      refs.camera = new THREE.PerspectiveCamera(tier.cameraFov, w / h, 0.1, 2000);
      refs.camera.position.set(initialCamera.x, initialCamera.y, initialCamera.z);

      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: tier.useAntialias,
        alpha: true,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
      });
      syncRendererToCanvas();
      refs.renderer.setClearColor(0x000000, 0);
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = tuning.toneExposure;

      if (tier.useBloom) {
        try {
          const bw = Math.max(2, Math.floor(w * tier.bloomResolutionScale));
          const bh = Math.max(2, Math.floor(h * tier.bloomResolutionScale));
          refs.composer = new EffectComposer(refs.renderer);
          refs.composer.setSize(w, h);
          refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
          const bloom = new UnrealBloomPass(
            new THREE.Vector2(bw, bh),
            HERO_SCENE.bloomStrength,
            HERO_SCENE.bloomRadius,
            HERO_SCENE.bloomThreshold
          );
          refs.composer.addPass(bloom);
          refs.bloomPass = bloom;
          syncRendererToCanvas();
        } catch {
          refs.composer?.dispose?.();
          refs.composer = null;
          refs.bloomPass = null;
          refs.renderer.toneMappingExposure = tuning.toneExposure * 1.05;
        }
      } else {
        refs.composer = null;
        refs.bloomPass = null;
      }

      const starTex = createStarPointSpriteTexture();

      const starPointClampMax = tier.useBloom ? 56.0 : 68.0;

      const starVert = `
attribute float size;
attribute vec3 color;
varying vec3 vColor;
uniform float time;
uniform float depth;
uniform float pointClampMax;
void main() {
  vColor = color;
  vec3 p = position;
  float ang = time * 0.05 * (1.0 - depth * 0.3);
  float co = cos(ang);
  float si = sin(ang);
  p.xy = mat2(co, -si, si, co) * p.xy;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float ez = max(4.0, -mv.z);
  float ps = size * (280.0 / ez);
  gl_PointSize = clamp(ps, 2.0, pointClampMax);
  gl_Position = projectionMatrix * mv;
}`;

      const starFrag = `
uniform sampler2D pointTexture;
uniform float starBoost;
varying vec3 vColor;
void main() {
  vec4 tex = texture2D(pointTexture, gl_PointCoord);
  if (tex.a < 0.06) discard;
  vec3 rgb = vColor * tex.rgb * starBoost;
  gl_FragColor = vec4(rgb, tex.a);
}`;

      const pushStarShellArrays = (
        count: number,
        pos: Float32Array,
        col: Float32Array,
        sizes: Float32Array | null,
        rand: () => number,
        radiusScale = 1,
      ) => {
        for (let j = 0; j < count; j++) {
          const r = (200 + rand() * 800) * radiusScale;
          const theta = rand() * Math.PI * 2;
          const phi = Math.acos(rand() * 2 - 1);
          pos[j * 3] = r * Math.sin(phi) * Math.cos(theta);
          pos[j * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          pos[j * 3 + 2] = r * Math.cos(phi);
          const c = new THREE.Color();
          const roll = rand();
          if (roll < 0.45) c.setHSL(0, 0, 0.75 + rand() * 0.22);
          else if (roll < 0.62) c.setHSL(0.62, 0.45, 0.55 + rand() * 0.15);
          else if (roll < 0.78) c.setHSL(0.78, 0.42, 0.55 + rand() * 0.15);
          else c.setHSL(0.48, 0.35, 0.48 + rand() * 0.12);
          col[j * 3] = c.r;
          col[j * 3 + 1] = c.g;
          col[j * 3 + 2] = c.b;
          if (sizes) {
            sizes[j] = (rand() * 2 + 0.5) * tier.starSizeScale;
          }
        }
      };

      /** Custom point shaders are flaky on many mobile GPUs; use PointsMaterial + slow group spin instead. */
      const useMobileFriendlyStars = !tier.useBloom;

      if (useMobileFriendlyStars) {
        const mobileLayers: {
          count: number;
          pointSize: number;
          spin: number;
          radius: number;
          seedSalt: number;
        }[] = [
          {
            count: Math.max(400, Math.floor(tier.starCount * 0.52)),
            pointSize: 5.2,
            spin: 0.026,
            radius: 0.68,
            seedSalt: 1,
          },
          {
            count: Math.max(350, Math.floor(tier.starCount * 0.42)),
            pointSize: 7.8,
            spin: 0.016,
            radius: 1,
            seedSalt: 2,
          },
        ];

        for (let li = 0; li < mobileLayers.length; li++) {
          const L = mobileLayers[li];
          const pos = new Float32Array(L.count * 3);
          const col = new Float32Array(L.count * 3);
          const starRand = mulberry32((HERO_STAR_SEED + L.seedSalt * 0x9e3779b9) >>> 0);
          pushStarShellArrays(L.count, pos, col, null, starRand, L.radius);

          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

          const mat = new THREE.PointsMaterial({
            map: starTex,
            size: L.pointSize,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            toneMapped: true,
          });
          mat.color.multiplyScalar(tuning.starBoost);

          const pts = new THREE.Points(geo, mat);
          pts.frustumCulled = false;
          pts.userData.simpleMobileStars = true;
          pts.userData.spinSpeed = L.spin;
          pts.userData.wobblePhase = li * 1.7;
          refs.scene!.add(pts);
          refs.stars.push(pts);
        }
      } else {
        for (let layer = 0; layer < 3; layer++) {
          const count = tier.starCount;
          const pos = new Float32Array(count * 3);
          const col = new Float32Array(count * 3);
          const sizes = new Float32Array(count);
          const starRand = mulberry32((HERO_STAR_SEED + Math.imul(layer, 0x9e3779b9)) >>> 0);
          pushStarShellArrays(count, pos, col, sizes, starRand, 1);

          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
          geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
          const mat = new THREE.ShaderMaterial({
            uniforms: {
              pointTexture: { value: starTex },
              time: { value: 0 },
              depth: { value: layer },
              pointClampMax: { value: starPointClampMax },
              starBoost: { value: tuning.starBoost },
            },
            vertexShader: starVert,
            fragmentShader: starFrag,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const pts = new THREE.Points(geo, mat);
          pts.frustumCulled = false;
          refs.scene!.add(pts);
          refs.stars.push(pts);
        }
      }

      const nebGeo = new THREE.PlaneGeometry(8000, 4000, HERO_SCENE.nebulaSegs, HERO_SCENE.nebulaSegs);
      const nebMat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x1a2852) },
          color2: { value: new THREE.Color(0x2d6a5c) },
          color3: { value: new THREE.Color(0x6b4fc8) },
          opacity: { value: tuning.nebulaOpacity },
          /** Without bloom, additive center column reads as a vertical "beam" on some GPUs */
          verticalBeamSuppress: { value: tier.useBloom ? 0 : 1 },
        },
        vertexShader: `
        varying vec2 vUv; varying float vElev; uniform float time;
        void main(){ vUv=uv; vec3 p=position;
        float e=sin(p.x*0.01+time)*cos(p.y*0.01+time)*20.0;
        p.z+=e; vElev=e; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
        fragmentShader: `
        uniform vec3 color1; uniform vec3 color2; uniform vec3 color3;
        uniform float opacity; uniform float time; uniform float verticalBeamSuppress;
        varying vec2 vUv; varying float vElev;
        void main(){
          float m1=sin(vUv.x*8.0+time*0.8)*cos(vUv.y*9.0-time*0.5)*0.5+0.5;
          float m2=sin(vUv.x*5.0-time*0.6)*cos(vUv.y*11.0+time*0.4)*0.5+0.5;
          vec3 band=mix(color1,color2,m1);
          vec3 c=mix(band,color3,m2*0.55);
          c=mix(c,vec3(0.45,0.35,0.75),0.12* sin(vUv.y*6.3+time));
          float a=opacity*(1.0-length(vUv-0.5)*2.0); a*=1.0+vElev*0.008;
          float cx = abs(vUv.x - 0.5) * 2.0;
          float beamAtten = mix(1.0, smoothstep(0.06, 0.48, cx), verticalBeamSuppress);
          a *= beamAtten;
          gl_FragColor=vec4(c,a);
        }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const nebula = new THREE.Mesh(nebGeo, nebMat);
      nebula.position.z = -1050;
      refs.scene.add(nebula);
      refs.nebula = nebula;

      let layerIdx = 0;
      for (const l of HERO_SCENE.mountainLayers) {
        const mountRand = mulberry32((HERO_MOUNTAIN_SEED + layerIdx * 9973) >>> 0);
        const points: THREE.Vector2[] = [];
        const segs = HERO_SCENE.mountainPathSegs;
        for (let s = 0; s <= segs; s++) {
          const x = (s / segs - 0.5) * 1000;
          const y =
            Math.sin(s * 0.1) * l.height * HERO_SCENE.mountainHeightScale +
            Math.sin(s * 0.05) * l.height * HERO_SCENE.mountainHeightScale * 0.5 +
            mountRand() * l.height * 0.2 * HERO_SCENE.mountainHeightScale -
            100;
          points.push(new THREE.Vector2(x, y));
        }
        points.push(new THREE.Vector2(5000, -500));
        points.push(new THREE.Vector2(-5000, -500));
        const shape = new THREE.Shape(points);
        const geo = new THREE.ShapeGeometry(shape);
        const base = new THREE.Color(l.color);
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            baseColor: { value: new THREE.Vector3(base.r, base.g, base.b) },
            opacity: { value: l.opacity },
          },
          vertexShader: `
            varying float vY;
            void main() {
              vY = position.y;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: `
            uniform vec3 baseColor;
            uniform float opacity;
            varying float vY;
            void main() {
              float ridge = smoothstep(-130.0, 40.0, vY);
              vec3 dark = baseColor * 0.5;
              vec3 lit = baseColor * 1.22;
              vec3 c = mix(dark, lit, ridge);
              gl_FragColor = vec4(c, opacity);
            }`,
          transparent: true,
          side: THREE.FrontSide,
          depthWrite: true,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.z = l.distance;
        mesh.position.y = HERO_SCENE.mountainYOffset;
        mesh.userData = { baseOpacity: l.opacity };
        refs.scene!.add(mesh);
        refs.mountains.push(mesh);
        layerIdx += 1;
      }

      const atmGeo = new THREE.SphereGeometry(600, HERO_SCENE.atmSegs, HERO_SCENE.atmSegs);
      const atmMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, intensity: { value: tuning.atmosphereIntensity } },
        vertexShader: `
        varying vec3 vNormal;
        void main(){ vNormal=normalize(normalMatrix*normal);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
        varying vec3 vNormal; uniform float time; uniform float intensity;
        void main(){ float i=pow(0.7-dot(vNormal,vec3(0,0,1)),2.0);
        vec3 blue=vec3(0.12,0.18,0.42); vec3 green=vec3(0.15,0.35,0.32); vec3 violet=vec3(0.35,0.22,0.55);
        vec3 a=mix(mix(blue,green,sin(time*0.4)*0.5+0.5),violet,0.45)*i;
        a*=sin(time*2.0)*0.08+0.92;
        gl_FragColor=vec4(a,i*intensity); }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      const atm = new THREE.Mesh(atmGeo, atmMat);
      refs.scene.add(atm);
      refs.atmosphere = atm;

      const animate = () => {
        if (cancelled) return;
        refs.animationId = requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        refs.stars.forEach((s) => {
          const obj = s as THREE.Points;
          if (obj.userData.simpleMobileStars) {
            const spin = (obj.userData.spinSpeed as number) ?? 0.02;
            const phase = (obj.userData.wobblePhase as number) ?? 0;
            obj.rotation.y = t * spin;
            obj.rotation.x = Math.sin(t * 0.11 + phase) * 0.05;
            return;
          }
          const mat = obj.material;
          if (mat instanceof THREE.ShaderMaterial && mat.uniforms?.time) {
            mat.uniforms.time.value = t;
          }
        });
        if (refs.nebula) {
          const nebU = (refs.nebula.material as THREE.ShaderMaterial).uniforms;
          nebU.time.value = t * 0.5;
          smoothNebulaOpacity.current += (refs.nebulaTargetOpacity - smoothNebulaOpacity.current) * 0.03;
          nebU.opacity.value = smoothNebulaOpacity.current;
        }
        if (refs.atmosphere) {
          const atmU = (refs.atmosphere.material as THREE.ShaderMaterial).uniforms;
          atmU.time.value = t;
        }
        if (refs.bloomPass) {
          smoothBloom.current += (refs.bloomTarget - smoothBloom.current) * 0.03;
          refs.bloomPass.strength = smoothBloom.current;
        }

        const sf = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * sf;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * sf;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * sf;

        smoothMountainOpacity.current += (refs.mountainOpacity - smoothMountainOpacity.current) * 0.04;
        refs.mountains.forEach((m) => {
          const mat = m.material as THREE.ShaderMaterial;
          const op = m.userData.baseOpacity * smoothMountainOpacity.current;
          if (mat.uniforms.opacity) mat.uniforms.opacity.value = op;
        });

        if (refs.camera) {
          refs.camera.position.x = smoothCameraPos.current.x + Math.sin(t * 0.1) * 2;
          refs.camera.position.y = smoothCameraPos.current.y + Math.cos(t * 0.15) * 1;
          refs.camera.position.z = smoothCameraPos.current.z;
          refs.camera.lookAt(0, HERO_SCENE.lookAtY, -600);
        }

        if (refs.composer) {
          refs.composer.render();
        } else if (refs.renderer && refs.scene && refs.camera) {
          refs.renderer.render(refs.scene, refs.camera);
        }
      };
      animate();
      setIsReady(true);

      const handleResize = () => syncRendererToCanvas();
      ro = new ResizeObserver(handleResize);
      ro.observe(canvasEl);
      window.addEventListener("resize", handleResize);
      const vv = window.visualViewport;
      vv?.addEventListener("resize", handleResize);
      const rafPostA = requestAnimationFrame(handleResize);
      const rafPostB = requestAnimationFrame(handleResize);

      const cleanup = () => {
        cancelled = true;
        cancelAnimationFrame(rafPostA);
        cancelAnimationFrame(rafPostB);
        ro?.disconnect();
        window.removeEventListener("resize", handleResize);
        vv?.removeEventListener("resize", handleResize);
        if (refs.animationId) cancelAnimationFrame(refs.animationId);
        refs.stars.forEach((s) => {
          const obj = s as THREE.Points;
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        });
        starTex.dispose();
        refs.mountains.forEach((m) => {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        });
        if (refs.nebula) {
          refs.nebula.geometry.dispose();
          (refs.nebula.material as THREE.Material).dispose();
        }
        if (refs.atmosphere) {
          refs.atmosphere.geometry.dispose();
          (refs.atmosphere.material as THREE.Material).dispose();
        }
        refs.composer?.dispose();
        refs.renderer?.dispose();
        refs.scene = null;
        refs.camera = null;
        refs.renderer = null;
        refs.composer = null;
        refs.bloomPass = null;
        refs.stars = [];
        refs.nebula = null;
        refs.mountains = [];
        refs.atmosphere = null;
        refs.animationId = null;
      };

      return cleanup;
    };

    let cleanupFn: (() => void) | undefined;

    const boot = () => {
      if (cancelled) return;
      const w = canvasEl.clientWidth;
      const h = canvasEl.clientHeight;
      if (w >= 2 && h >= 2) {
        cleanupFn = runFullInit();
        return;
      }
      rafBoot = requestAnimationFrame(boot);
    };

    boot();

    return () => {
      cancelled = true;
      if (rafBoot !== null) cancelAnimationFrame(rafBoot);
      cleanupFn?.();
      ro?.disconnect();
      setIsReady(false);
    };
  }, [iosStaticMode]);

  const updateBeatReveal = useCallback(() => {
    const parent = sectionsRef.current;
    if (!parent || prefersReducedMotionRef.current) return;
    const secs = parent.querySelectorAll<HTMLElement>(".hero-scroll-section");
    const vh = getViewportHeightForReveal();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const viewCenter = vh * (coarse ? 0.36 : 0.44);
    const band = vh * (coarse ? 0.62 : 0.45);
    const falloff = coarse ? 1.35 : 1.85;
    const next: { opacity: number; translateY: number }[] = [];
    secs.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      const elCenter = r.top + r.height / 2;
      const dist = Math.abs(elCenter - viewCenter);
      let opacity = dist >= band ? 0 : 1 - (dist / band) ** falloff;
      opacity = Math.max(0, Math.min(1, opacity));
      const translateY = (elCenter - viewCenter) * (coarse ? 0.06 : 0.08);
      next.push({ opacity, translateY });
    });

    const narrowViewport =
      typeof window !== "undefined" &&
      Math.min(window.innerWidth, window.innerHeight) < MOBILE_BREAKPOINT_PX;
    if (narrowViewport && next.length >= 3) {
      const heroEl = parent.parentElement;
      if (heroEl) {
        const hr = heroEl.getBoundingClientRect();
        if (hr.bottom > window.innerHeight * 0.18) {
          next[2] = {
            ...next[2],
            opacity: Math.max(next[2].opacity, 0.94),
          };
        }
      }
    }

    const opacityEps = coarse ? 0.03 : 0.04;
    setBeatReveal((prev) => {
      if (
        prev.length === next.length &&
        next.every(
          (n, i) =>
            Math.abs(n.opacity - prev[i].opacity) < opacityEps &&
            Math.abs(n.translateY - prev[i].translateY) < 1.5
        )
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const heroHeight = containerRef.current.offsetHeight;
    const heroTop = window.scrollY + rect.top;
    const heroScroll = Math.max(0, window.scrollY - heroTop);
    const firstSec = sectionsRef.current?.querySelector<HTMLElement>(".hero-scroll-section");
    const vhForScroll = firstSec?.offsetHeight ?? window.innerHeight;
    const maxHeroScroll = heroHeight - vhForScroll;
    const progress = maxHeroScroll > 0 ? Math.min(heroScroll / maxHeroScroll, 1) : 0;

    const narrowViewport =
      Math.min(window.innerWidth, window.innerHeight) < MOBILE_BREAKPOINT_PX;
    const tailPx = narrowViewport
      ? vhForScroll * (HERO_MOBILE_TAIL_DVH / VIEWPORT_UNITS_PER_BEAT)
      : 0;
    const contentHeroHeight = Math.max(heroHeight - tailPx, vhForScroll);
    const maxSceneScroll = Math.max(0, contentHeroHeight - vhForScroll);
    const sceneScroll = Math.min(heroScroll, maxSceneScroll);
    const progressScene =
      maxSceneScroll > 0 ? Math.min(1, sceneScroll / maxSceneScroll) : 1;

    setScrollProgress(progress);

    const heroBottom = rect.bottom;
    setHeroInView(heroBottom > 0);

    if (!prefersReducedMotionRef.current) {
      updateBeatReveal();
    }

    const sectionIdx = Math.min(
      SECTIONS.length - 1,
      Math.max(0, Math.floor(progress * SECTIONS.length))
    );
    setCurrentSection(sectionIdx);

    const refs = threeRefs.current;
    if (!refs.renderer || iosStaticMode === "yes") return;

    const camT = progress * (SECTIONS.length - 1);
    const camLow = Math.min(Math.floor(camT), SECTIONS.length - 2);
    const camFrac = camT - camLow;

    const cameraPositions = HERO_SCENE.cameraPositions;
    const cur = cameraPositions[camLow] || cameraPositions[0];
    const nxt = cameraPositions[camLow + 1] || cur;

    refs.targetCameraX = cur.x + (nxt.x - cur.x) * camFrac;
    refs.targetCameraY = cur.y + (nxt.y - cur.y) * camFrac;
    refs.targetCameraZ = cur.z + (nxt.z - cur.z) * camFrac;

    if (progressScene < 0.3) {
      refs.mountainOpacity = 1;
    } else if (progressScene < 0.55) {
      refs.mountainOpacity = 1 - ((progressScene - 0.3) / 0.25);
    } else {
      refs.mountainOpacity = 0;
    }

    const baseNeb = refs.useBloom ? HERO_SCENE.baseNebulaOpacity : getRenderTuning(false).nebulaOpacity;
    const bloomStr = refs.useBloom ? HERO_SCENE.bloomStrength : 0;

    if (progressScene < 0.5) {
      refs.nebulaTargetOpacity = baseNeb;
      refs.bloomTarget = bloomStr;
    } else {
      const deep = (progressScene - 0.5) / 0.5;
      refs.nebulaTargetOpacity = baseNeb - deep * HERO_SCENE.nebulaFade;
      refs.bloomTarget = bloomStr - deep * HERO_SCENE.bloomFade;
    }
  }, [updateBeatReveal, iosStaticMode]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    const vv = window.visualViewport;
    const onVv = () => handleScroll();
    vv?.addEventListener("resize", onVv);
    vv?.addEventListener("scroll", onVv);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      vv?.removeEventListener("resize", onVv);
      vv?.removeEventListener("scroll", onVv);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setBeatReveal(SECTIONS.map(() => ({ opacity: 1, translateY: 0 })));
      return;
    }
    const id = requestAnimationFrame(() => updateBeatReveal());
    return () => cancelAnimationFrame(id);
  }, [prefersReducedMotion, isMobileViewport, updateBeatReveal]);

  const showStaticIos = iosStaticMode === "yes";
  const showCanvas = iosStaticMode !== "yes";

  return (
    <div
      ref={containerRef}
      className="hero-container"
      style={{
        height: isMobileViewport
          ? `${heroTotalVh + HERO_MOBILE_TAIL_DVH}dvh`
          : `${heroTotalVh}vh`,
      }}
    >
      {showStaticIos && (
        <img
          src={IOS_HERO_STATIC_SRC}
          className="hero-canvas hero-static-fallback"
          alt=""
          decoding="async"
          onLoad={() => setIsReady(true)}
        />
      )}
      {showCanvas && (
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          style={{
            opacity: isReady ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
          aria-hidden
        />
      )}

      <div ref={sectionsRef} className="hero-scroll-sections">
        {SECTIONS.map((sec, i) => {
          const revealStyle = !prefersReducedMotion
            ? {
                opacity: beatReveal[i]?.opacity ?? 1,
                transform: `translate3d(0, ${beatReveal[i]?.translateY ?? 0}px, 0)`,
                willChange: "opacity, transform" as const,
              }
            : undefined;
          const sectionDim = isMobileViewport ? "100dvh" : "100vh";
          return (
            <section
              key={sec.title}
              className="hero-scroll-section"
              style={{
                minHeight: sectionDim,
                height: sectionDim,
              }}
              aria-label={sec.title}
            >
              <div className="hero-scroll-section-inner" style={revealStyle}>
                <h1 className="hero-title gradient-text-highlight">
                  {sec.title}
                </h1>
                <div className="hero-subtitle">
                  {sec.lines.map((line, li) => (
                    <p key={li} className="subtitle-line">{line}</p>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div
        ref={scrollProgressRef}
        className="scroll-progress"
        style={{
          opacity: isReady && heroInView ? 1 : 0,
          transition: "opacity 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="scroll-text">SCROLL</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <div className="section-counter">
          {String(currentSection + 1).padStart(2, "0")} / {String(totalSections).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
