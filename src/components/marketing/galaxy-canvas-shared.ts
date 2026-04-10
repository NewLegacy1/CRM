/**
 * Shared Three.js galaxy scene constants and helpers (homepage hero + marketing backdrop).
 */
import * as THREE from "three";

export const MOBILE_BREAKPOINT_PX = 768;

export const HERO_STAR_SEED = 0x5f3759df;

export const HERO_SCENE = {
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
  bloomRadius: 0.42,
  bloomThreshold: 0.88,
  cameraPositions: [
    { x: 0, y: 30, z: 300 },
    { x: 0, y: 40, z: -50 },
    { x: 0, y: 50, z: -700 },
  ],
} as const;

export function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PerformanceTier {
  pixelRatioCap: number;
  starCount: number;
  starSizeScale: number;
  bloomResolutionScale: number;
  useAntialias: boolean;
  cameraFov: number;
  useBloom: boolean;
}

function isAppleTouchDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function getPerformanceTier(innerWidth: number, innerHeight: number): PerformanceTier {
  const shortSide = Math.min(innerWidth, innerHeight);
  const mobile = shortSide < MOBILE_BREAKPOINT_PX;
  const appleTouch = isAppleTouchDevice();

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

export function getRenderTuning(useBloom: boolean): {
  toneExposure: number;
  nebulaOpacity: number;
  atmosphereIntensity: number;
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

export function createStarPointSpriteTexture(): THREE.CanvasTexture {
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

/** Nebula + bloom targets matching the hero’s final scroll pose (deep space, no mountains). */
export function getBackdropNebulaBloomTargets(useBloom: boolean): {
  nebulaOpacity: number;
  bloomStrength: number;
} {
  const baseNeb = useBloom ? HERO_SCENE.baseNebulaOpacity : getRenderTuning(false).nebulaOpacity;
  const bloomStr = useBloom ? HERO_SCENE.bloomStrength : 0;
  return {
    nebulaOpacity: Math.max(0, baseNeb - HERO_SCENE.nebulaFade),
    bloomStrength: Math.max(0, bloomStr - HERO_SCENE.bloomFade),
  };
}
