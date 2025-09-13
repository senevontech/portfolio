import React, { useEffect } from "react";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Contact from "./components/Contacts";
import Footer from "./components/Footer";
import "./styles/index.css";
import MouseSpotlight from "./components/MouseSpotlight";
// for tools section 
import LogoLoop from './components/tools';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';
import Tools from "./components/tools";

// magic liquid 
import MagicLiquid from './components/magicLiquid';



// tools section 
const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

// Alternative with image sources
const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

export default function App() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);


  return (
    <div className="site wrap-gradient">
      <MagicLiquid/>
      <MouseSpotlight radius={320} intensity={0.9} softness={0.65} />

      
      <header className="nav">
        <div className="brand">
          {/* <span className="brand-mark">S</span>enevon */}
          <img src="/Images/Logo/neon-logo.png" alt="logo" className="logo-img" />
        </div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="hire-btn" href="#contact">Hire Us</a>
      </header>

      <main>
        <Hero />
        <Services />
        <Projects />

        {/* tools section  */}
        {/* <div style={{ height: '200px', position: 'relative', overflow: 'hidden'}}>
      <LogoLoop
        logos={techLogos}
        speed={120}
        direction="left"
        logoHeight={48}
        gap={40}
        pauseOnHover
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
      />
    </div> */}
        {/* tools section  */}
        <Tools/>
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
