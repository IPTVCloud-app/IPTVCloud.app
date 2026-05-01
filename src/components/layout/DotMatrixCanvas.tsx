"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function DotMatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let lastFrame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const shouldAnimate = !reducedMotion && !coarsePointer;

    const dotSize = 1;
    const spacing = 24;
    const flashlightRadius = 220;

    const isDark = resolvedTheme === "dark";
    const baseColorRgb = isDark ? "255, 255, 255" : "0, 0, 0";
    const brandColorRgb = "113, 112, 255";
    const baseOpacity = isDark ? 0.035 : 0.045;

    let mouseX = -1000;
    let mouseY = -1000;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.floor(width / spacing) + 1;
      const rows = Math.floor(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          const dx = mouseX - x;
          const dy = mouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let displayX = x;
          let displayY = y;

          if (shouldAnimate && mouseX >= 0 && mouseY >= 0 && distance > 0) {
            displayX = x + ((x - mouseX) / distance) * (spacing * 0.5);
            displayY = y + ((y - mouseY) / distance) * (spacing * 0.5);
          }

          ctx.beginPath();
          ctx.arc(displayX, displayY, dotSize, 0, Math.PI * 2);

          if (distance < flashlightRadius) {
            const intensity = 1 - distance / flashlightRadius;
            ctx.fillStyle = `rgba(${brandColorRgb}, ${Math.max(baseOpacity, intensity * 0.8)})`;
          } else {
            ctx.fillStyle = `rgba(${baseColorRgb}, ${baseOpacity})`;
          }

          ctx.fill();
        }
      }

      if (shouldAnimate && mouseX >= 0 && mouseY >= 0) {
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, flashlightRadius);
        gradient.addColorStop(0, `rgba(${brandColorRgb}, 0.07)`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const animate = (time: number) => {
      if (time - lastFrame > 33) {
        draw();
        lastFrame = time;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resize();
      if (!shouldAnimate) draw();
    };

    window.addEventListener("resize", handleResize);
    if (shouldAnimate) {
      resize();
      animationFrameId = requestAnimationFrame(animate);
    } else {
      resize();
      draw();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ display: "block" }}
    />
  );
}
