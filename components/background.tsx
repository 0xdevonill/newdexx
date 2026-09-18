"use client";

import { useEffect, useRef } from "react";

type Ring = { x: number; y: number; born: number; life: number };

export function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const dots: { x: number; y: number; s: number; p: number }[] = [];
    const rings: Ring[] = [];
    let lastSpawn = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots.length = 0;
      const cols = Math.ceil(window.innerWidth / 28);
      const rows = Math.ceil(window.innerHeight / 28);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if ((x + y) % 3 !== 0) continue;
          dots.push({
            x: x * 28 + 8,
            y: y * 28 + 8,
            s: 1.2 + ((x * 7 + y * 13) % 3) * 0.4,
            p: (x * 0.17 + y * 0.11) % 1,
          });
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const theme = document.documentElement.dataset.theme;
      const light = theme === "light";
      for (const d of dots) {
        const pulse = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.0007 + d.p * 12));
        ctx.fillStyle = light
          ? `rgba(0, 122, 61, ${pulse * 0.4})`
          : `rgba(0, 255, 135, ${pulse * 0.28})`;
        ctx.fillRect(d.x, d.y, d.s, d.s);
      }
      if (t - lastSpawn > 1400) {
        lastSpawn = t;
        rings.push({
          x: 80 + Math.random() * Math.max(120, window.innerWidth - 160),
          y: 80 + Math.random() * Math.max(120, window.innerHeight - 160),
          born: t,
          life: 2800 + Math.random() * 900,
        });
        if (rings.length > 8) rings.shift();
      }
      for (const ring of rings) {
        const k = (t - ring.born) / ring.life;
        if (k >= 1) continue;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 12 + k * 140, 0, Math.PI * 2);
        ctx.strokeStyle = light
          ? `rgba(0, 122, 61, ${(1 - k) * 0.28})`
          : `rgba(0, 255, 135, ${(1 - k) * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="bg-field" aria-hidden />
      <div className="bg-wash" aria-hidden />
    </>
  );
}
