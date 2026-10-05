/* ==========================================================================
   SPRINKLE RAIN — fixed full-page canvas of falling sprinkles.
   Sits above section backgrounds but below page content. Sprinkles drift,
   spin, and get nudged away from the pointer. Respects reduced motion.
   Public API: window.Sprinkles.init(), window.Sprinkles.storm()
   ========================================================================== */
(function () {
  const COLORS = ['#FF6FA5', '#6FD3FF', '#FFD84D', '#7CE3B6', '#B28CFF', '#FF9F5A', '#FFFFFF'];
  let canvas, ctx, W, H, dpr, items = [], raf = null, mx = -999, my = -999;
  let reduce = false, coarse = false;

  function make(startAnywhere, fast) {
    return {
      x: Math.random() * W,
      y: startAnywhere ? Math.random() * H : -20 - Math.random() * 80,
      len: 10 + Math.random() * 8,
      vy: (fast ? 3 : 0.45) + Math.random() * (fast ? 3 : 0.9),
      vx: (Math.random() - 0.5) * 0.4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.03,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      temp: !!fast,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    for (let i = items.length - 1; i >= 0; i--) {
      const s = items[i];
      if (!reduce) {
        const dx = s.x - mx, dy = s.y - my, d2 = dx * dx + dy * dy;
        if (!coarse && d2 < 8100) { const d = Math.sqrt(d2) || 1; s.x += (dx / d) * 2.2; s.y += (dy / d) * 1.2; }
        s.x += s.vx; s.y += s.vy; s.rot += s.vr;
        if (s.y > H + 20) {
          if (s.temp) { items.splice(i, 1); continue; }
          s.y = -20; s.x = Math.random() * W;
        }
        if (s.x < -20) s.x = W + 20; else if (s.x > W + 20) s.x = -20;
      }
      const ox = Math.cos(s.rot) * s.len / 2, oy = Math.sin(s.rot) * s.len / 2;
      ctx.strokeStyle = 'rgba(59,35,64,0.55)';
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(s.x - ox, s.y - oy); ctx.lineTo(s.x + ox, s.y + oy); ctx.stroke();
      ctx.strokeStyle = s.c;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(s.x - ox, s.y - oy); ctx.lineTo(s.x + ox, s.y + oy); ctx.stroke();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  function init() {
    if (canvas) return;
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    coarse = window.matchMedia('(pointer: coarse)').matches;
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;left:0;top:0;z-index:1;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    resize();
    const count = coarse ? 26 : 64;
    for (let i = 0; i < count; i++) items.push(make(true, false));
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    draw();
  }

  function storm() {
    if (!canvas) return;
    for (let i = 0; i < 220; i++) { const s = make(false, true); s.y = -Math.random() * H * 0.8; items.push(s); }
    if (reduce && !raf) { reduce = false; draw(); }
  }

  window.Sprinkles = { init, storm };
})();

/* ==========================================================================
   CONFETTI — physics-based paper confetti on its own top canvas.
   Public API: Confetti.burst(x, y, n), Confetti.celebrate(), Confetti.rain(n)
   ========================================================================== */
(function () {
  const COLORS = ['#FF6FA5', '#6FD3FF', '#FFD84D', '#7CE3B6', '#B28CFF', '#FF9F5A', '#FFFFFF'];
  let cv, cx, W, H, dpr, parts = [], raf = null;

  function ensure() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;left:0;top:0;z-index:600;pointer-events:none;';
    document.body.appendChild(cv);
    cx = cv.getContext('2d');
    size();
    window.addEventListener('resize', size);
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function piece(x, y, vx, vy) {
    return {
      x, y, vx, vy,
      w: 7 + Math.random() * 7, h: 4 + Math.random() * 5,
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.35,
      tilt: Math.random() * 6.28, vt: 0.08 + Math.random() * 0.14,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      round: Math.random() < 0.25,
      life: 0, max: 110 + Math.random() * 70,
    };
  }

  function loop() {
    cx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.28;
      p.x += p.vx + Math.sin(p.tilt) * 0.8; p.y += p.vy;
      p.rot += p.vr; p.tilt += p.vt; p.life++;
      if (p.life > p.max || p.y > H + 30) { parts.splice(i, 1); continue; }
      const fade = p.life > p.max - 30 ? (p.max - p.life) / 30 : 1;
      cx.save();
      cx.globalAlpha = Math.max(0, fade);
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.scale(1, Math.cos(p.tilt));
      cx.fillStyle = p.c;
      cx.strokeStyle = '#3B2340';
      cx.lineWidth = 1.5;
      if (p.round) { cx.beginPath(); cx.arc(0, 0, p.h * 0.7, 0, 6.28); cx.fill(); cx.stroke(); }
      else { cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      cx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = null; cx.clearRect(0, 0, W, H); }
  }

  function start() { if (!raf) raf = requestAnimationFrame(loop); }
  function calm(n) { return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.min(n, 16) : n; }

  function burst(x, y, n) {
    ensure();
    n = calm(n || 70);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const s = 5 + Math.random() * 10;
      parts.push(piece(x, y, Math.cos(a) * s, Math.sin(a) * s));
    }
    start();
  }

  function rain(n) {
    ensure();
    n = calm(n || 140);
    for (let i = 0; i < n; i++) {
      const p = piece(Math.random() * W, -20 - Math.random() * H * 0.5, (Math.random() - 0.5) * 2, 1 + Math.random() * 3);
      p.max = 200 + Math.random() * 80;
      parts.push(p);
    }
    start();
  }

  function celebrate() {
    ensure();
    const n = calm(80);
    for (let i = 0; i < n; i++) {
      const sA = -Math.PI / 2 + 0.55 - Math.random() * 0.5, sB = -Math.PI / 2 - 0.55 + Math.random() * 0.5;
      const s = 11 + Math.random() * 9;
      parts.push(piece(0, H, Math.cos(sA) * s, Math.sin(sA) * s));
      parts.push(piece(W, H, Math.cos(sB) * s, Math.sin(sB) * s));
    }
    start();
    setTimeout(() => rain(120), 500);
  }

  window.Confetti = { burst, rain, celebrate };
})();
