// src/components/Tools.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/tools.css";

/** Your icons */
const ICONS = [
  { src: "/Images/tools/nodejs.svg", name: "Node.js" },
  { src: "/Images/tools/express.svg", name: "Express" },
  { src: "/Images/tools/flutter.svg", name: "Flutter" },
  { src: "/Images/tools/git.svg", name: "Git" },
  { src: "/Images/tools/mongodb.png", name: "MongoDB" },
  { src: "/Images/tools/react.svg", name: "React" },
  { src: "/Images/tools/tailwind.svg", name: "Tailwind" },
  { src: "/Images/tools/vite.svg", name: "Vite" },
  { src: "/Images/tools/blender.svg", name: "Blender" },
  { src: "/Images/tools/excel.svg", name: "excel" },
  { src: "/Images/tools/python.svg", name: "python" },
  { src: "/Images/tools/figma.svg", name: "Figma" },
  { src: "/Images/tools/javascript.svg", name: "JavaScript" },
  { src: "/Images/tools/photoshop.svg", name: "Photoshop" },
  { src: "/Images/tools/sql.png", name: "SQL" },
  { src: "/Images/tools/html.png", name: "HTML5" },
  { src: "/Images/tools/django.png", name: "Django" },
  { src: "/Images/tools/powerBi.svg", name: "PowerBi" },
  { src: "/Images/tools/Aiml.png", name: "machine learning" },
  { src: "/Images/tools/dart.svg", name: "dart" },

];

export default function Tools() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const iconRefs = useRef([]);

  // movement
  const [offset, setOffset] = useState(0);   // px (negative = left)
  const [rowWidth, setRowWidth] = useState(0);

  // live refs to avoid stale closures
  const offsetRef = useRef(0);
  offsetRef.current = offset;

  // config
  const SPEED_PX_PER_SEC = 110;   // marquee speed,   default(110)
  const CENTER_THRESHOLD_PX = 1136; // pop sensitivity,   default(36)
  const POP_DURATION_MS = 1000;    // pop hold,   default(300)
  const HYSTERESIS_PX = 800;       // min travel between pops, def(80)

  // [row, row] for seamless loop
  const row = [...ICONS, ...ICONS];

  // width helper: include margins
  const fullWidthWithMargins = (el) => {
    const w = el.getBoundingClientRect().width;
    const cs = window.getComputedStyle(el);
    const ml = parseFloat(cs.marginLeft) || 0;
    const mr = parseFloat(cs.marginRight) || 0;
    return w + ml + mr;
  };

  // measure row width after mount, resize, and image loads
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const kids = Array.from(trackRef.current.children).slice(0, ICONS.length);
      const w = kids.reduce((acc, el) => acc + fullWidthWithMargins(el), 0);
      setRowWidth(w);
    };

    // initial + next tick (after layout)
    measure();
    requestAnimationFrame(measure);

    // observe size changes
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);

    // re-measure when any icon image finishes loading
    const imgs = trackRef.current?.querySelectorAll("img") || [];
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", measure, { once: true });
      img.addEventListener("error", measure, { once: true });
    });

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    let lastPoppedIdx = -1;
    let lastPopOffset = 0;

    const distanceMovedSincePop = () => {
      const curr = offsetRef.current; // negative or 0
      if (!rowWidth) return 0;
      // Convert to positive distance on the loop
      const currPos = (rowWidth + (curr % rowWidth)) % rowWidth; // 0..rowWidth
      const lastPos = (rowWidth + (lastPopOffset % rowWidth)) % rowWidth;
      if (currPos >= lastPos) return currPos - lastPos;
      return (rowWidth - lastPos) + currPos;
    };

    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      if (rowWidth > 0) {
        // move LEFT (negative), wrap at -rowWidth -> add rowWidth
        setOffset((prev) => {
          let next = prev - SPEED_PX_PER_SEC * dt;
          if (next <= -rowWidth) next += rowWidth;
          return next;
        });

        // center detection (no pausing)
        const container = containerRef.current;
        if (container && trackRef.current) {
          const cRect = container.getBoundingClientRect();
          const centerX = cRect.left + cRect.width / 2;

          let nearest = { idx: -1, dist: Infinity, el: null };
          iconRefs.current.forEach((el, idx) => {
            if (!el) return;
            const r = el.getBoundingClientRect();
            const iconCenter = r.left + r.width / 2;
            const d = Math.abs(iconCenter - centerX);
            if (d < nearest.dist) nearest = { idx, dist: d, el };
          });

          if (
            nearest.idx !== -1 &&
            nearest.dist < CENTER_THRESHOLD_PX &&
            nearest.idx !== lastPoppedIdx &&
            distanceMovedSincePop() > HYSTERESIS_PX
          ) {
            nearest.el.classList.add("toolIcon--pop");
            lastPoppedIdx = nearest.idx;
            lastPopOffset = offsetRef.current;
            setTimeout(() => {
              nearest.el && nearest.el.classList.remove("toolIcon--pop");
            }, POP_DURATION_MS);
          }
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [rowWidth]);

  return (
    <section id="tools" className="tools reveal">
      <h2 className="tools__title">Tools We Use</h2>

      <div className="tools-viewport" ref={containerRef}>
        <div
          ref={trackRef}
          className="tools-track"
          style={{ transform: `translateX(${offset}px)` }} // offset will be ≤ 0
        >
          {row.map((t, i) => {
            const label = t.name ?? t.src.split("/").pop()?.split(".")[0] ?? "tool";
            return (
              <div
                key={`${label}-${i}`}
                ref={(el) => (iconRefs.current[i] = el)}
                className="toolIcon"
                title={label}
                aria-label={label}
              >
                <img src={t.src} alt={label} />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
