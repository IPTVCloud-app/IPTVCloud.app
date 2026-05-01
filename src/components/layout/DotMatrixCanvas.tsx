"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function DotMatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const dotSize = 1;
    const spacing = 24;
    const connectionRadius = 100;
    const flashlightRadius = 250;

    // Adjust these based on the linear design theme
    // Dark mode: #f7f8f8 (Primary Text), Light mode: #1a1a1e
    const isDark = resolvedTheme === "dark";
    const baseColorRgb = isDark ? "255, 255, 255" : "0, 0, 0";
    const brandColorRgb = "113, 112, 255"; // #7170ff (Accent Violet)
    const baseOpacity = isDark ? 0.03 : 0.05;

    let mouseX = -1000;
    let mouseY = -1000;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    resize();

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

          // Draw connections
          if (distance < connectionRadius) {
            const intensity = 1 - distance / connectionRadius;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(${brandColorRgb}, ${intensity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Draw the dot
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);

          if (distance < flashlightRadius) {
            const intensity = 1 - distance / flashlightRadius;
            ctx.fillStyle = `rgba(${brandColorRgb}, ${Math.max(baseOpacity, intensity * 0.8)})`;
          } else {
            ctx.fillStyle = `rgba(${baseColorRgb}, ${baseOpacity})`;
          }

          ctx.fill();
        }
      }

      // Flashlight gradient overlay
      if (mouseX >= 0 && mouseY >= 0) {
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, flashlightRadius);
        gradient.addColorStop(0, `rgba(${brandColorRgb}, 0.08)`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
      style={{ display: "block" }}
    />
  );
}
