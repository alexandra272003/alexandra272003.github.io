/* ==========================================================================
   FLAPPY BIRD — hand-written canvas game, HUD/telemetry theme.
   Public API: window.FlappyBirdGame.init(canvas) -> { destroy() }
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'aps_portfolio_flappy_best';
  const AVATAR_URL = 'https://avatars.githubusercontent.com/u/143160283?v=4&s=256';
  const TAGLINE = 'FLAPPY BIRD OR ALIEN SHOOTING... CUZ WHY NOT?';

  const avatarImg = new Image();
  let avatarReady = false;
  avatarImg.onload = () => { avatarReady = true; };
  avatarImg.src = AVATAR_URL;

  function drawAvatarBadge(ctx, cx, cy, r){
    if(!avatarReady) return;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFD84D';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255,216,77,0.7)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function init(canvas){
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const GRAVITY = 0.45;
    const FLAP = -8;
    const PIPE_GAP = 165;
    const PIPE_WIDTH = 68;
    const PIPE_SPEED = 2.6;
    const PIPE_EVERY = 95;
    const GROUND_Y = H - 44;
    const MARGIN = 84;

    let bird, pipes, particles, frame, score, best, state, groundOffset, animId;

    function reset(){
      bird = { x: 120, y: H / 2, vy: 0, r: 14, rot: 0 };
      pipes = [];
      particles = [];
      frame = 0;
      score = 0;
      groundOffset = 0;
      state = 'ready'; // ready | playing | dead
      best = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    }

    function spawnPipe(){
      const span = H - MARGIN * 2 - PIPE_GAP;
      const gapY = MARGIN + Math.random() * Math.max(40, span);
      pipes.push({ x: W + 20, gapY, passed: false });
    }

    function burst(x, y, color, count){
      for(let i = 0; i < count; i++){
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 1,
          life: 26 + Math.random() * 10,
          c: color,
        });
      }
    }

    function flap(){
      if(state === 'ready'){ state = 'playing'; }
      else if(state === 'dead'){ reset(); return; }
      bird.vy = FLAP;
      burst(bird.x - 10, bird.y, '#FFD84D', 4);
    }

    function die(){
      if(state !== 'playing') return;
      state = 'dead';
      if(score > best){ best = score; localStorage.setItem(STORAGE_KEY, String(best)); }
      burst(bird.x, bird.y, '#FF6FA5', 20);
    }

    function update(){
      frame++;

      if(state === 'playing'){
        bird.vy += GRAVITY;
        bird.y += bird.vy;
        bird.rot = Math.max(-0.5, Math.min(1.2, bird.vy / 10));

        if(frame % PIPE_EVERY === 0) spawnPipe();

        pipes.forEach((p) => { p.x -= PIPE_SPEED; });
        pipes = pipes.filter((p) => p.x > -PIPE_WIDTH - 10);

        pipes.forEach((p) => {
          if(!p.passed && p.x + PIPE_WIDTH < bird.x){ p.passed = true; score++; }
          const withinX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_WIDTH;
          if(withinX){
            const topEdge = p.gapY, botEdge = p.gapY + PIPE_GAP;
            if(bird.y - bird.r < topEdge || bird.y + bird.r > botEdge) die();
          }
        });

        if(bird.y + bird.r > GROUND_Y){ bird.y = GROUND_Y - bird.r; die(); }
        if(bird.y - bird.r < 0){ bird.y = bird.r; bird.vy = 0; }

        groundOffset = (groundOffset + PIPE_SPEED) % 28;
      }

      particles.forEach((pt) => { pt.x += pt.vx; pt.y += pt.vy; pt.life--; });
      particles = particles.filter((pt) => pt.life > 0);
    }

    function drawGrid(){
      ctx.strokeStyle = 'rgba(232,236,246,0.05)';
      ctx.lineWidth = 1;
      for(let gx = 0; gx < W; gx += 32){ ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for(let gy = 0; gy < H; gy += 32){ ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    }

    function draw(){
      ctx.fillStyle = '#3B2340';
      ctx.fillRect(0, 0, W, H);
      drawGrid();

      pipes.forEach((p) => {
        ctx.shadowColor = 'rgba(255,111,165,0.45)'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#FF6FA5';
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gapY);
        ctx.fillRect(p.x, p.gapY + PIPE_GAP, PIPE_WIDTH, H - (p.gapY + PIPE_GAP));
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#3B2340';
        ctx.fillRect(p.x + 6, 0, PIPE_WIDTH - 12, Math.max(0, p.gapY - 8));
        ctx.fillRect(p.x + 6, p.gapY + PIPE_GAP + 8, PIPE_WIDTH - 12, Math.max(0, H - (p.gapY + PIPE_GAP) - 8));
      });

      ctx.fillStyle = '#4D2F57';
      ctx.fillRect(0, GROUND_Y, W, 44);
      ctx.strokeStyle = 'rgba(255,216,77,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();
      ctx.fillStyle = 'rgba(232,236,246,0.07)';
      for(let gx = -groundOffset; gx < W; gx += 28){ ctx.fillRect(gx, GROUND_Y + 8, 14, 4); }

      particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life / 30);
        ctx.fillStyle = pt.c;
        ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
        ctx.globalAlpha = 1;
      });

      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rot);
      ctx.shadowColor = 'rgba(255,216,77,0.7)'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#FFD84D';
      ctx.beginPath(); ctx.arc(0, 0, bird.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3B2340';
      ctx.beginPath(); ctx.arc(5, -4, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FF6FA5';
      ctx.beginPath();
      ctx.moveTo(bird.r - 2, 0); ctx.lineTo(bird.r + 9, -3); ctx.lineTo(bird.r + 9, 3);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255,216,77,0.5)'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#E8ECF6';
      ctx.font = "700 40px 'Fredoka', sans-serif";
      ctx.fillText(String(score), W / 2, 70);
      ctx.shadowBlur = 0;
      ctx.font = "600 11px 'Fredoka', sans-serif";
      ctx.fillStyle = '#9AA6C3';
      ctx.fillText('BEST ' + best, W / 2, 92);

      if(state === 'ready'){
        drawAvatarBadge(ctx, W / 2, H / 2 - 92, 38);
        ctx.fillStyle = '#E8ECF6';
        ctx.font = "700 22px 'Bangers', cursive";
        ctx.fillText('FLAPPY BIRD', W / 2, H / 2 - 26);
        ctx.font = "500 12px 'Fredoka', sans-serif";
        ctx.fillStyle = '#9AA6C3';
        ctx.fillText('TAP / CLICK / SPACE TO FLAP', W / 2, H / 2 + 4);
        ctx.font = "500 10.5px 'Fredoka', sans-serif";
        ctx.fillStyle = '#6E7A99';
        ctx.fillText(TAGLINE, W / 2, H / 2 + 26);
      }
      if(state === 'dead'){
        ctx.fillStyle = 'rgba(59,35,64,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#FF6FA5';
        ctx.font = "700 24px 'Bangers', cursive";
        ctx.fillText('GAME OVER', W / 2, H / 2 - 18);
        ctx.fillStyle = '#E8ECF6';
        ctx.font = "600 14px 'Fredoka', sans-serif";
        ctx.fillText('SCORE ' + score + '   BEST ' + best, W / 2, H / 2 + 12);
        ctx.fillStyle = '#9AA6C3';
        ctx.font = "500 12px 'Fredoka', sans-serif";
        ctx.fillText('TAP TO RETRY', W / 2, H / 2 + 38);
      }
      ctx.textAlign = 'left';
    }

    function loop(){
      update();
      draw();
      animId = requestAnimationFrame(loop);
    }

    function onKey(e){
      if(e.code === 'Space'){ e.preventDefault(); flap(); }
    }
    function onPointer(e){ e.preventDefault(); flap(); }

    reset();
    canvas.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    animId = requestAnimationFrame(loop);

    return {
      destroy(){
        cancelAnimationFrame(animId);
        canvas.removeEventListener('pointerdown', onPointer);
        window.removeEventListener('keydown', onKey);
      },
    };
  }

  window.FlappyBirdGame = { init };
})();
