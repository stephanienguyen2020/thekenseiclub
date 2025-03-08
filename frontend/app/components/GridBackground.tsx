"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
};

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    const starCount = 200;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * 1000,
          size: 1,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawStarfield = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center origin
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Draw and update stars
      stars.forEach((star) => {
        // Update z position (moving toward viewer)
        star.z -= 0.5;

        // Reset star if it's too close
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
          star.z = 1000;
          star.opacity = Math.random() * 0.8 + 0.2;
        }

        // Project 3D position to 2D screen
        const projectedX = (star.x / star.z) * 500;
        const projectedY = (star.y / star.z) * 500;

        // Calculate size based on distance
        const projectedSize = Math.max(0.5, ((1000 - star.z) / 1000) * 3);

        // Draw star
        ctx.beginPath();
        ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);

        // Color based on distance
        const brightness = (1000 - star.z) / 1000;
        const r = Math.floor(56 + brightness * 100);
        const g = Math.floor(189 + brightness * 30);
        const b = Math.floor(248);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity})`;
        ctx.fill();

        // Add glow for brighter stars
        if (projectedSize > 1.5) {
          ctx.beginPath();
          ctx.arc(projectedX, projectedY, projectedSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity * 0.15})`;
          ctx.fill();
        }
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(drawStarfield);
    };

    drawStarfield();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
}
