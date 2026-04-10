"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { mulberry32 } from "@/components/marketing/galaxy-shared";

const VIEWPORT_UNITS_PER_BEAT = 100;
const HERO_MOBILE_TAIL_DVH = 0;
const MOBILE_BREAKPOINT_PX = 768;
const HERO_STAR_SEED = 0x5f3759df;
const HERO_MOUNTAIN_SEED = 0xdeadbeef;

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

const CAMERA_KEYS = [
  { x: 0, y: 22, z: 118 },
  { x: 42, y: 26, z: 92 },
  { x: -36, y: 20, z: 74 },
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

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [heroInView, setHeroInView] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [beatReveal, setBeatReveal] = useState(initialBeatReveal);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    composer: EffectComposer | null;
    stars: THREE.Points | null;
    nebula: THREE.Mesh | null;
    mountains: THREE.Mesh | null;
    animationId: number | null;
    cam: { x: number; y: number; z: number };
    mountainOp: number;
    nebulaOp: number;
    bloom: number;
    useBloom: boolean;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    composer: null,
    stars: null,
    nebula: null,
    mountains: null,
    animationId: null,
    cam: { ...CAMERA_KEYS[0] },
    mountainOp: 1,
    nebulaOp: 0.14,
    bloom: 0.45,
    useBloom: true,
  });

  const totalSections = SECTIONS.length;
  const heroTotalVh = VIEWPORT_UNITS_PER_BEAT * totalSections;

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onMq = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useLayoutEffect(() => {
    const upd = () =>
      setIsMobileViewport(
        Math.min(window.innerWidth, window.innerHeight) < MOBILE_BREAKPOINT_PX
      );
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setBeatReveal(SECTIONS.map(() => ({ opacity: 1, translateY: 0 })));
    }
  }, [prefersReducedMotion]);

  const updateBeatReveal = useCallback(
    (progressScene: number) => {
      if (prefersReducedMotion) return;
      const idx = Math.min(
        totalSections - 1,
        Math.max(0, Math.floor(progressScene * totalSections))
      );
      setBeatReveal(
        SECTIONS.map((_, i) => ({
          opacity: i === idx ? 1 : Math.max(0, 0.35 - Math.abs(i - idx) * 0.35),
          translateY: i === idx ? 0 : i < idx ? -12 : 12,
        }))
      );
    },
    [prefersReducedMotion, totalSections]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const useBloom = !isMobileViewport;
    const rndStars = mulberry32(HERO_STAR_SEED);
    const rndMount = mulberry32(HERO_MOUNTAIN_SEED);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobileViewport,
      alpha: true,
      powerPreference: "high-performance",
    });
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050308, useBloom ? 0.018 : 0.022);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.5, 2500);
    camera.position.set(CAMERA_KEYS[0].x, CAMERA_KEYS[0].y, CAMERA_KEYS[0].z);
    camera.lookAt(0, 8, 0);

    const starCount = useBloom ? 9000 : 5000;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 280 + rndStars() * 720;
      const th = rndStars() * Math.PI * 2;
      const ph = Math.acos(2 * rndStars() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.55;
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffe0c2,
      size: useBloom ? 1.35 : 1.8,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const nebulaGeo = new THREE.SphereGeometry(520, 48, 48);
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: 0x3b1f5c,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    scene.add(nebula);

    const segs = 80;
    const mGeo = new THREE.PlaneGeometry(420, 120, segs, segs);
    const posAttr = mGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const n1 = Math.sin(x * 0.02 + rndMount() * 2) * 6;
      const n2 = Math.cos(y * 0.04 + rndMount() * 3) * 8;
      const ridge = Math.exp(-((x + 40) ** 2) / 2800) * 28;
      posAttr.setZ(i, n1 + n2 + ridge);
    }
    mGeo.computeVertexNormals();
    const mMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0c,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
      transparent: true,
      opacity: 1,
    });
    const mountains = new THREE.Mesh(mGeo, mMat);
    mountains.rotation.x = -Math.PI / 2.35;
    mountains.position.set(0, -18, -80);
    scene.add(mountains);

    scene.add(new THREE.AmbientLight(0x6a4a9e, 0.35));
    const dir = new THREE.DirectionalLight(0xffb366, useBloom ? 0.55 : 0.35);
    dir.position.set(40, 60, 40);
    scene.add(dir);

    let composer: EffectComposer | null = null;
    if (useBloom) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(w, h),
        0.45,
        0.6,
        0.85
      );
      composer.addPass(bloom);
    }

    threeRef.current = {
      renderer,
      scene,
      camera,
      composer,
      stars,
      nebula,
      mountains,
      animationId: null,
      cam: { ...CAMERA_KEYS[0] },
      mountainOp: 1,
      nebulaOp: 0.16,
      bloom: 0.45,
      useBloom,
    };

    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const cw = c.clientWidth;
      const ch = c.clientHeight;
      camera.aspect = cw / Math.max(1, ch);
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch, false);
      if (composer) {
        composer.setSize(cw, ch);
      }
    };
    window.addEventListener("resize", resize);
    setIsReady(true);

    const loop = () => {
      const t = threeRef.current;
      if (!t.renderer || !t.scene || !t.camera) return;
      t.animationId = requestAnimationFrame(loop);
      const { cam } = t;
      const p = t.camera.position;
      p.x += (cam.x - p.x) * 0.08;
      p.y += (cam.y - p.y) * 0.08;
      p.z += (cam.z - p.z) * 0.08;
      t.camera.lookAt(0, 10, 0);
      if (t.stars) t.stars.rotation.y += 0.00006;
      if (t.nebula) {
        t.nebula.rotation.y += 0.00004;
        const mat = t.nebula.material as THREE.MeshBasicMaterial;
        mat.opacity = t.nebulaOp;
      }
      if (t.mountains) {
        const mat = t.mountains.material as THREE.MeshStandardMaterial;
        mat.opacity = t.mountainOp;
        mat.transparent = t.mountainOp < 1;
      }
      if (t.composer) t.composer.render();
      else t.renderer.render(t.scene, t.camera);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      const t = threeRef.current;
      if (t.animationId) cancelAnimationFrame(t.animationId);
      starGeo.dispose();
      starMat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
      mGeo.dispose();
      mMat.dispose();
      if (t.composer) t.composer.dispose();
      renderer.dispose();
      threeRef.current.renderer = null;
    };
  }, [isMobileViewport]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh =
      typeof window !== "undefined"
        ? window.visualViewport?.height ?? window.innerHeight
        : 800;
    const heroHeight = el.offsetHeight;
    const heroTop = rect.top;
    const heroBottom = rect.bottom;

    const scrolledPastTop = -heroTop;
    const maxScroll = Math.max(1, heroHeight - vh);
    const raw = scrolledPastTop / maxScroll;
    const progress = Math.min(1, Math.max(0, raw));

    setScrollProgress(progress);
    setHeroInView(heroBottom > 0);

    const progressScene = progress;
    updateBeatReveal(progressScene);

    const sectionIdx = Math.min(
      totalSections - 1,
      Math.max(0, Math.floor(progressScene * totalSections))
    );
    setCurrentSection(sectionIdx);

    const t = progressScene * (totalSections - 1);
    const low = Math.min(Math.floor(t), totalSections - 2);
    const frac = t - low;
    const a = CAMERA_KEYS[low];
    const b = CAMERA_KEYS[low + 1] ?? a;
    const ref = threeRef.current;
    ref.cam = {
      x: a.x + (b.x - a.x) * frac,
      y: a.y + (b.y - a.y) * frac,
      z: a.z + (b.z - a.z) * frac,
    };

    if (progressScene < 0.32) {
      ref.mountainOp = 1;
    } else if (progressScene < 0.58) {
      ref.mountainOp = 1 - (progressScene - 0.32) / 0.26;
    } else {
      ref.mountainOp = 0;
    }

    const baseNeb = 0.16;
    if (progressScene < 0.48) {
      ref.nebulaOp = baseNeb;
      ref.bloom = ref.useBloom ? 0.45 : 0;
    } else {
      const d = (progressScene - 0.48) / 0.52;
      ref.nebulaOp = baseNeb * (1 - d * 0.65);
      ref.bloom = ref.useBloom ? 0.45 * (1 - d * 0.7) : 0;
    }
  }, [totalSections, updateBeatReveal]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    const vv = window.visualViewport;
    const v = () => handleScroll();
    vv?.addEventListener("resize", v);
    vv?.addEventListener("scroll", v);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      vv?.removeEventListener("resize", v);
      vv?.removeEventListener("scroll", v);
    };
  }, [handleScroll]);

  const sectionDim = isMobileViewport ? "100dvh" : "100vh";

  return (
    <div
      ref={containerRef}
      className="hero-container relative isolate"
      style={{
        height: isMobileViewport
          ? `calc(${heroTotalVh + HERO_MOBILE_TAIL_DVH}dvh)`
          : `${heroTotalVh}vh`,
      }}
    >
      <div className="sticky top-0 z-0 h-[100dvh] max-h-[100vh] w-full overflow-hidden md:max-h-none md:h-screen">
        <canvas
          ref={canvasRef}
          className="hero-canvas absolute inset-0 h-full w-full touch-none"
          style={{
            opacity: isReady ? 1 : 0,
            transition: "opacity 0.6s ease-out",
          }}
          aria-hidden
        />
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10">
        {SECTIONS.map((sec, i) => {
          const revealStyle = !prefersReducedMotion
            ? {
                opacity: beatReveal[i]?.opacity ?? 1,
                transform: `translate3d(0, ${beatReveal[i]?.translateY ?? 0}px, 0)`,
                willChange: "opacity, transform" as const,
              }
            : undefined;
          return (
            <section
              key={sec.title}
              className="hero-scroll-section flex items-center justify-center"
              style={{
                minHeight: sectionDim,
                height: sectionDim,
              }}
              aria-label={sec.title}
            >
              <div
                className="hero-scroll-section-inner max-w-4xl px-4 text-center md:px-8"
                style={revealStyle}
              >
                <h1 className="hero-title gradient-text-highlight">
                  {sec.title}
                </h1>
                <div className="hero-subtitle mt-5 space-y-2">
                  {sec.lines.map((line) => (
                    <p key={line} className="subtitle-line text-lg text-zinc-300 md:text-xl">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div
        ref={scrollProgressRef}
        className="scroll-progress pointer-events-none fixed bottom-8 right-6 z-20 hidden flex-col items-end gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500 sm:flex"
        style={{
          opacity: isReady && heroInView ? 1 : 0,
          transition: "opacity 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="scroll-text">Scroll</div>
        <div className="progress-track h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className="progress-fill h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <div className="section-counter text-zinc-400">
          {String(currentSection + 1).padStart(2, "0")} /{" "}
          {String(totalSections).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
