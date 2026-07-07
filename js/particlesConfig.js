/* ==========================================================================
   AMBIENT FIELD — particles.js network, sitting behind the HUD grid.
   Palette-matched (signal cyan / ignition amber), mouse-reactive, respects
   prefers-reduced-motion by rendering a static, non-moving field.
   Public API: window.ParticlesBg.init()
   ========================================================================== */
(function () {
  function init() {
    if (typeof particlesJS === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    // On mobile: far fewer particles, no connecting lines (the line-drawing
    // loop in particles.js is O(n²) and visibly stresses Android Chrome).
    particlesJS('particles-bg', {
      particles: {
        number: {
          value: isCoarse ? 20 : 62,
          density: { enable: true, value_area: 1000 },
        },
        color: { value: ['#3fe0d0', '#ff8a42'] },
        shape: { type: 'circle' },
        opacity: { value: 0.4, random: true, anim: { enable: false } },
        size: { value: 2, random: true },
        line_linked: {
          // Disable entirely on mobile — O(n²) per frame, big cost for a subtle effect
          enable: !isCoarse,
          distance: 130, color: '#3fe0d0', opacity: 0.12, width: 1,
        },
        move: {
          enable: !prefersReducedMotion,
          speed: isCoarse ? 0.3 : 0.45,
          direction: 'none',
          random: true, straight: false, out_mode: 'out', bounce: false,
        },
      },
      interactivity: {
        detect_on: 'window',
        events: {
          onhover: { enable: !isCoarse, mode: 'grab' },
          onclick: { enable: false },
          resize: true,
        },
        modes: {
          grab: { distance: 150, line_linked: { opacity: 0.35 } },
        },
      },
      retina_detect: false, // retina doubles the canvas resolution — not worth it for bg dots
    });
  }

  window.ParticlesBg = { init };
})();
