/* ==========================================================================
   HERO SCENE — Three.js wireframe core + orbiting particle field.
   Sits behind the hero copy, reacts to pointer position.
   Public API: window.HeroScene.init(canvas) -> { destroy() } | null
   ========================================================================== */
(function () {
  function init(canvas) {
    if (typeof THREE === 'undefined' || !canvas) return null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip the Three.js scene entirely on mobile / coarse-pointer devices.
    // A spinning WebGL scene on top of particles.js on top of a game modal is
    // too much GPU work for Android Chrome — the canvas just shows transparent.
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return null;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch (e) {
      return null; // no WebGL — hero copy still works fine without it
    }
    // Cap pixel ratio at 1.5 — going to 3× on retina mobile wastes GPU for no
    // visible gain at the small sizes the hero canvas renders at.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 8.6;

    const group = new THREE.Group();
    scene.add(group);

    // Wireframe core — icosahedron edges, signal cyan
    const coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const core = new THREE.LineSegments(
      coreEdges,
      new THREE.LineBasicMaterial({ color: 0x3fe0d0, transparent: true, opacity: 0.55 })
    );
    group.add(core);

    // Faint inner fill so the core reads as a volume, not just wires
    const fill = new THREE.Mesh(
      coreGeo,
      new THREE.MeshBasicMaterial({ color: 0x3fe0d0, transparent: true, opacity: 0.035 })
    );
    group.add(fill);

    // Ambient particle field — ignition amber, scattered in a shell around the core
    const PARTICLE_COUNT = 160; // reduced from 220 — imperceptibly lighter on mid-range GPUs
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 3.3 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff8a42, size: 0.05, transparent: true, opacity: 0.7, sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let targetRotX = 0, targetRotY = 0;
    function onPointerMove(e) {
      const relX = e.clientX / window.innerWidth - 0.5;
      const relY = e.clientY / window.innerHeight - 0.5;
      targetRotY = relX * 0.55;
      targetRotX = relY * 0.35;
    }
    window.addEventListener('pointermove', onPointerMove);

    let animId = null;
    let t = 0;

    function frame() {
      t += 0.0026;
      core.rotation.y = t * 3.1;
      core.rotation.x = t * 1.05;
      fill.rotation.copy(core.rotation);
      particles.rotation.y = -t * 0.7;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.045;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.045;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      animId = requestAnimationFrame(frame);
    }

    return {
      destroy() {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onPointerMove);
        renderer.dispose();
        coreGeo.dispose(); coreEdges.dispose();
        particleGeo.dispose(); particleMat.dispose();
      },
    };
  }

  window.HeroScene = { init };
})();
