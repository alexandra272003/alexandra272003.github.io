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

    particlesJS('particles-bg', {
      particles: {
        number: {
          value: isCoarse ? 34 : 62,
          density: { enable: true, value_area: 1000 },
        },
        color: { value: ['#3fe0d0', '#ff8a42'] },
        shape: { type: 'circle' },
        opacity: { value: 0.4, random: true, anim: { enable: false } },
        size: { value: 2, random: true },
        line_linked: {
          enable: true, distance: 130, color: '#3fe0d0', opacity: 0.12, width: 1,
        },
        move: {
          enable: !prefersReducedMotion, speed: 0.45, direction: 'none',
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
      retina_detect: true,
    });
  }

  window.ParticlesBg = { init };
})();
