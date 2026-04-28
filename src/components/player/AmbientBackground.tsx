"use client";

import React, { useEffect, useRef } from "react";

interface AmbientBackgroundProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
}

export function AmbientBackground({ videoRef, isActive }: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;

    let lastDrawTime = 0;
    const fps = 10; // Draw 10 times a second for performance
    const interval = 1000 / fps;

    const drawFrame = (time: number) => {
      if (!video.paused && !video.ended) {
        if (time - lastDrawTime >= interval) {
          // Only draw a scaled down version for better performance
          const width = 128;
          const height = 72;
          
          if (canvas.width !== width) canvas.width = width;
          if (canvas.height !== height) canvas.height = height;

          try {
            ctx.drawImage(video, 0, 0, width, height);
          } catch (e) {
            // Ignore CrossOrigin errors if the stream isn't configured right
          }
          lastDrawTime = time;
        }
      }
      animationRef.current = requestAnimationFrame(drawFrame);
    };

    // Start drawing
    video.addEventListener("play", () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(drawFrame);
    });

    // Initial draw if already playing
    if (!video.paused && !video.ended) {
      animationRef.current = requestAnimationFrame(drawFrame);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, videoRef]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10 scale-110 opacity-70 transition-opacity duration-1000 pointer-events-none"
      style={{
        filter: "blur(60px) saturate(2)",
        transform: "scale(1.05)",
      }}
      aria-hidden="true"
    />
  );
}
