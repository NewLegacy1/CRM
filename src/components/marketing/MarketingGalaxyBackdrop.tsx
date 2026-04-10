"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/components/marketing/galaxy-canvas-shared";

/**
 * Subtle animated starfield for marketing subpages (hero already has the full scene on /).
 */
export default function MarketingGalaxyBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rnd = mulberry32(0x9e3779b9);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      el.clientWidth / Math.max(1, el.clientHeight),
      0.1,
      2000
    );
    camera.position.z = 420;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x050508, 1);
    el.appendChild(renderer.domElement);

    const starCount = 6000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 400 + rnd() * 900;
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(2 * rnd() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xe8c4a0,
      size: 1.2,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);

    const nebulaGeo = new THREE.SphereGeometry(650, 32, 32);
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: 0x2d1b4e,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    scene.add(nebula);

    let rid = 0;
    const tick = (t: number) => {
      rid = requestAnimationFrame(tick);
      stars.rotation.y = t * 0.00002;
      nebula.rotation.y = t * 0.000015;
      renderer.render(scene, camera);
    };
    rid = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (!el) return;
      const w = el.clientWidth;
      const h = Math.max(1, el.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(rid);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="marketing-galaxy-canvas pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
