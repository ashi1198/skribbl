import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export function PointerTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];

    // Resize canvas to fill the entire window screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse or touch coordinates and spawn particles
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let x = 0;
      let y = 0;

      if ("touches" in e) {
        if (e.touches.length === 0) return;
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }

      // Generate a bright random color
      const hue = Math.floor(Math.random() * 360);
      const color = `hsla(${hue}, 90%, 65%, `;

      // Spawn 3 particles per movement ticks for dense trailing
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: x + (Math.random() * 10 - 5),
          y: y + (Math.random() * 10 - 5),
          size: Math.random() * 8 + 4, // Particle base radius size
          color: color,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015, // Speed at which particle fades away
        });
      }
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Animation Render Loop
    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        // Smooth glow effects
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${p.color}${p.alpha})`;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };
    render();

    // Clean up all listeners on component unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents:
          "none" /* Key line: allows clicks to pass straight through to inputs/buttons */,
        zIndex: 1 /* Keeps it right between the background layout and card elements */,
      }}
    />
  );
}
