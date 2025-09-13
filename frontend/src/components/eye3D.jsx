// Eye3D.jsx
import React, { useEffect, useRef } from "react";
import "../styles/eye3D.css";

/**
 * Props:
 *  - size: number (px) — overall eye size (default 220)
 *  - className: string — extra classes for wrapper
 *  - irisColor: CSS color (default "#4ea5ff")
 *  - glowColor: CSS color (default "rgba(78,165,255,0.6)")
 *  - tilt: number — max tilt in degrees (default 10)
 */
export default function Eye3D({
  size = 220,
  className = "",
  irisColor = "#4ea5ff",
  glowColor = "rgba(78,165,255,0.6)",
  tilt = 10,
}) {
  const rootRef = useRef(null);
  const eyeRef = useRef(null);
  const irisRef = useRef(null);
  const pupilRef = useRef(null);
  const rafRef = useRef(0);

  const target = useRef({ x: 0, y: 0 });   // normalized -1..1
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onMove = (clientX, clientY) => {
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let nx = (clientX - cx) / (rect.width / 2);
      let ny = (clientY - cy) / (rect.height / 2);
      // clamp
      nx = Math.max(-1, Math.min(1, nx));
      ny = Math.max(-1, Math.min(1, ny));
      target.current.x = nx;
      target.current.y = ny;
    };

    const handleMouseMove = (e) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    // Listen on window for a nicer parallax; keep a local "leave" to recenter
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    root.addEventListener("mouseleave", handleLeave);

    const animate = () => {
      // ease toward target
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;

      const x = current.current.x;
      const y = current.current.y;

      // Tilt the whole eye
      if (eyeRef.current) {
        eyeRef.current.style.transform = `rotateY(${x * tilt}deg) rotateX(${-y * tilt}deg)`;
      }

      // Use CSS vars so we don't overwrite base transforms
      const irisMax = size * 0.065;  // px
      const pupilMax = size * 0.055; // px

      if (irisRef.current) {
        irisRef.current.style.setProperty("--dx", `${x * irisMax}px`);
        irisRef.current.style.setProperty("--dy", `${y * irisMax}px`);
      }
      if (pupilRef.current) {
        pupilRef.current.style.setProperty("--dx", `${x * pupilMax}px`);
        pupilRef.current.style.setProperty("--dy", `${y * pupilMax}px`);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      root.removeEventListener("mouseleave", handleLeave);
    };
  }, [size, tilt]);

  const styleVars = {
    "--eye-size": `${size}px`,
    "--iris-color": irisColor,
    "--glow-color": glowColor,
  };

  return (
    <div
      ref={rootRef}
      className={`eye3d-root ${className}`}
      style={styleVars}
      aria-label="Interactive 3D eye"
      role="img"
    >
      <div className="eye3d-orb" ref={eyeRef}>
        <div className="eye3d-sclera">
          <div className="eye3d-glass" />
          <div className="eye3d-iris" ref={irisRef}>
            <div className="eye3d-iris-texture" />
          </div>
          <div className="eye3d-pupil" ref={pupilRef} />
          <div className="eye3d-highlight eye3d-highlight-1" />
          <div className="eye3d-highlight eye3d-highlight-2" />
        </div>
        <div className="eye3d-glow" />
      </div>
    </div>
  );
}
