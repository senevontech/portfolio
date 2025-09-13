import React, { useEffect, useRef } from "react";

const row1 = [
  "Web Development","Graphics/Logo","Software","App Development",
  "Branding","UI/UX","Landing Pages","Dashboards",
];

const row2 = [
  "Web Design","Web Development","Graphics/Logo","Software",
  "E-Commerce","Prototyping","SEO","Animations",
];

/**
 * direction:  1 = rightwards,  -1 = leftwards
 * baseSpeed:  pixels per second (constant)
 * gap:        px gap between chips
 */
function MarqueeRow({ items, direction = 1, baseSpeed = 20, gap = 6 }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(0);

  const offsetRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const unitWidthRef = useRef(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;

    const rebuild = () => {
      track.innerHTML = "";

      // Build one set
      const mkChip = (txt) => {
        const s = document.createElement("span");
        s.className = "chip";
        s.textContent = txt;
        return s;
      };
      const set = document.createElement("div");
      set.style.display = "inline-flex";
      set.style.gap = `${gap}px`;
      items.forEach((t) => set.appendChild(mkChip(t)));

      track.appendChild(set);

      // Measure one set width
      const setW = set.getBoundingClientRect().width || 1;

      // Duplicate until track > 2x container (for seamless loop)
      const needW = (wrap.getBoundingClientRect().width || 1) * 2.2;
      while (track.getBoundingClientRect().width < needW) {
        track.appendChild(set.cloneNode(true));
      }

      unitWidthRef.current = setW;
      offsetRef.current = 0; // reset offset on rebuild
    };

    rebuild();
    const ro = new ResizeObserver(rebuild);
    ro.observe(wrap);

    const tick = (now) => {
      const dt = Math.max(0.001, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // advance offset (constant speed)
      offsetRef.current += baseSpeed * dt;

      // wrap to [0, unit)
      let off = offsetRef.current % unitWidthRef.current;
      if (off < 0) off += unitWidthRef.current;

      // apply direction: rightward (+off), leftward (−off)
      track.style.transform =
        direction === 1
          ? `translate3d(${off}px,0,0)`
          : `translate3d(${-off}px,0,0)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [items, direction, baseSpeed, gap]);

  return (
    <div className="marquee-mask">
      <div className="marquee-wrap" ref={wrapRef}>
        <div className="marquee-track" ref={trackRef} />
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="services reveal">
      <h2>Services</h2>

      {/* Row 1 → right */}
      <MarqueeRow items={row1} direction={1} baseSpeed={20} gap={6} />

      {/* Row 2 → left (opposite) */}
      <MarqueeRow items={row2} direction={-1} baseSpeed={20} gap={6} />
    </section>
  );
}
