import React, { useEffect, useRef } from "react";

/**
 * Full-page, GPU-friendly spotlight that follows the mouse.
 * - No pointer blocking (pointer-events: none)
 * - rAF-synchronized smoothing (inertia)
 * - Respects prefers-reduced-motion
 */
export default function MouseSpotlight({
  radius = 280,       // px size of hotspot
  intensity = 0.9,    // 0..1
  softness = 0.6,     // 0..1 (falloff softness)
}) {
  const elRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = elRef.current;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lerp = (a, b, t) => a + (b - a) * t;

    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const onTouch = (e) => {
      if (!e.touches || !e.touches[0]) return;
      targetX = e.touches[0].clientX;
      targetY = e.touches[0].clientY;
    };

    // initial position center
    el.style.setProperty("--spot-x", `${x}px`);
    el.style.setProperty("--spot-y", `${y}px`);
    el.style.setProperty("--spot-r", `${radius}px`);
    el.style.setProperty("--spot-intensity", intensity.toString());
    el.style.setProperty("--spot-soft", softness.toString());

    const tick = () => {
      // small smoothing; if reduced motion, jump directly
      const t = reduceMotion ? 1 : 0.12;
      x = lerp(x, targetX, t);
      y = lerp(y, targetY, t);
      el.style.setProperty("--spot-x", `${x}px`);
      el.style.setProperty("--spot-y", `${y}px`);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [radius, intensity, softness]);

  return <div className="mouse-spotlight" ref={elRef} aria-hidden="true" />;
}
