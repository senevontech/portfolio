import React, { useEffect, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import "../styles/projects.css";

const cards = [
  {
    title: "Online Code Editor",
    body: "A lightweight, customizable code editor built with modern web technologies.",
    image: "/Images/projects/only-ss/codeeditor.jpg",
    href: "https://example.com/project-one",
  },
  {
    title: "Project Two",
    body: "Client approval. Fun Lorem Ipsum text may appear in any size and font to simulate everything you create for your campaigns.",
    image: "/Images/projects/only-ss/toolit.jpg",
    href: "https://example.com/project-two",
  },
  {
    title: "Project Three",
    body: "Client approval. Fun Lorem Ipsum text may appear in any size and font to simulate everything you create for your campaigns.",
    image: "/Images/projects/only-ss/codemist.jpg",
    href: "https://example.com/project-three",
  },
  {
    title: "Project Four",
    body: "Client approval. Fun Lorem Ipsum text may appear in any size and font to simulate everything you create for your campaigns.",
    image: "/Images/projects/only-ss/tutora.jpg",
    href: "https://example.com/project-four",
  },
];

export default function Projects() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  // Memoize the row to avoid unnecessary recalculation
  const row = useMemo(() => [...cards, ...cards], []);

  return (
    <section id="projects" className="projects reveal">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={controls}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="projects__title"
      >
        Projects
      </motion.h2>

      <div className="proj-viewport">
        <motion.div
          className="proj-track"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        >
          {row.map((c, i) => (
            <motion.article
              key={`${c.title}-${i}`}
              initial={{ opacity: 0, y: 40 }}
              animate={controls}
              transition={{ duration: 0.6, delay: (i % cards.length) * 0.15 }}
              className="project glass card"
            >
              <a
                className="card__link"
                href={c.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${c.title} – open project`}
              >
                <img
                  className="card__img"
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  width="400"
                  height="250"
                />
                <div className="card__content">
                  <h4 className="card__title">{c.title}</h4>
                  <p className="card__body">{c.body}</p>
                </div>
              </a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}