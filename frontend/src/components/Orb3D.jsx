import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function Orb3D({
  modelUrl = "/models/metalicOrb9.glb",
  fit = 0.9,
  sizeMultiplier = 0.81,
  yOffset = 0.5,
}) {
  const mountRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 20, 60);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 0.4, 8.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.physicallyCorrectLights = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lowered for perf
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
    });
    mount.appendChild(renderer.domElement);

    // PMREM env for PBR reflections
    const pmremGen = new THREE.PMREMGenerator(renderer);
    const env = pmremGen.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.background = null;

    // Post FX
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0.08,
      0.6,
      0.85
    );
    composer.addPass(bloomPass);

    // Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x111122, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(0x8f7fff, 0.6, 40);
    rim.position.set(-5, -2, 4);
    scene.add(rim);

    // Rig
    const rig = new THREE.Group();
    scene.add(rig);

    // Soft ground
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(16, 64),
      new THREE.MeshBasicMaterial({ color: 0x2a2040, transparent: true, opacity: 0.12 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.0;
    rig.add(floor);

    // Load GLB
    const loader = new GLTFLoader();
    let mixer = null;

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene || gltf.scenes[0];
        model.traverse((o) => {
          if (o.isMesh && o.material) {
            const m = o.material;
            if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
            if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            if (m.roughnessMap) m.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace;
            if (m.metalnessMap) m.metalnessMap.colorSpace = THREE.LinearSRGBColorSpace;
            if ("envMapIntensity" in m) m.envMapIntensity = 1.0;
            if ("metalness" in m) m.metalness = Math.min(1, m.metalness ?? 0.8);
            if ("roughness" in m) m.roughness = Math.max(0, m.roughness ?? 0.3);
          }
        });

        // Center & auto-fit
        const root = model.clone(true);
        rig.add(root);

        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        root.position.sub(center);

        // Viewport at z≈0
        const dist = Math.abs(camera.position.z);
        const vFov = (camera.fov * Math.PI) / 180;
        const viewH = 2 * Math.tan(vFov / 2) * dist;
        const viewW = viewH * camera.aspect;

        const target = Math.max(0.1, Math.min(1, fit)) * Math.min(viewW, viewH);
        const maxDim = Math.max(size.x, size.y);
        const baseScale = maxDim > 0 ? target / maxDim : 1;

        root.scale.setScalar(baseScale * sizeMultiplier);
        root.position.y += yOffset;

        // Animations
        if (gltf.animations && gltf.animations.length) {
          mixer = new THREE.AnimationMixer(root);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).reset().setLoop(THREE.LoopRepeat, Infinity).play();
          });
        }
      },
      undefined,
      (err) => console.error("GLB load error:", err)
    );

    // Mouse + scroll
    let targetX = 0, targetY = 0;
    const onMouse = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetX = x * 0.5;
      targetY = y * 0.3;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const onScroll = () => {
      const t = window.scrollY || document.documentElement.scrollTop;
      rig.position.y = -t * 0.0008;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // Animation loop (throttled to 30 FPS)
    const clock = new THREE.Clock();
    let lastTime = 0;
    const fps = 30;
    const interval = 1 / fps;

    const tick = () => {
      const dt = clock.getDelta();
      lastTime += dt;
      if (lastTime > interval) {
        rig.rotation.y += (targetX - rig.rotation.y) * 0.06;
        rig.rotation.x += (targetY - rig.rotation.x) * 0.06;
        if (mixer) mixer.update(dt * 0.7);
        composer.render();
        lastTime = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      composer.dispose();
      pmremGen.dispose();
      renderer.dispose();
      env.dispose?.();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, fit, sizeMultiplier, yOffset]);

  return <div className="orb3d-mount" ref={mountRef} aria-hidden="true" />;
}