/* ==========================================================================
   ALIEN ONSLAUGHT — hand-written canvas game, HUD/telemetry theme.
   Endless scaling waves. Public API:
   window.AlienShooterGame.init(canvas) -> { destroy() }
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'aps_portfolio_alien_best';
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
    ctx.strokeStyle = '#ff8a42';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255,138,66,0.7)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function init(canvas){
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const PLAYER_W = 34, PLAYER_H = 18, PLAYER_SPEED = 5.2;
    const BULLET_SPEED = 8, FIRE_COOLDOWN = 13;
    const ALIEN_W = 26, ALIEN_H = 18;

    let player, bullets, alienBullets, aliens, particles;
    let wave, score, best, lives, state, frame, fireTimer;
    let groupDir, groupOffsetX, groupDropY, groupSpeed;
    let keys, pointerActive, pointerX, pointerFire, animId, hitFlash;

    function reset(){
      player = { x: W / 2 - PLAYER_W / 2, y: H - 56, invuln: 0 };
      bullets = []; alienBullets = []; particles = [];
      wave = 0; score = 0; lives = 3; state = 'ready'; frame = 0; fireTimer = 0;
      hitFlash = 0;
      best = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      keys = {}; pointerActive = false; pointerX = player.x; pointerFire = false;
      spawnWave();
    }

    function spawnWave(){
      wave++;
      const cols = Math.min(9, 4 + Math.ceil(wave / 2));
      const rows = Math.min(5, 2 + Math.floor(wave / 3));
      const spacingX = 42, spacingY = 34;
      const totalW = (cols - 1) * spacingX;
      const startX = (W - totalW) / 2;
      const startY = 60;

      aliens = [];
      for(let r = 0; r < rows; r++){
        for(let c = 0; c < cols; c++){
          aliens.push({
            baseX: startX + c * spacingX,
            baseY: startY + r * spacingY,
            alive: true,
            tier: r % 3,
          });
        }
      }
      groupDir = 1;
      groupOffsetX = 0;
      groupDropY = 0;
      groupSpeed = Math.min(2.6, 0.55 + wave * 0.14);
      alienBullets = [];
    }

    function burst(x, y, color, count){
      for(let i = 0; i < count; i++){
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 22 + Math.random() * 12,
          c: color,
        });
      }
    }

    function start(){ if(state === 'ready') state = 'playing'; else if(state === 'dead') reset(); }

    function fire(){
      if(state !== 'playing' || fireTimer > 0) return;
      bullets.push({ x: player.x + PLAYER_W / 2 - 2, y: player.y - 6 });
      fireTimer = FIRE_COOLDOWN;
      burst(player.x + PLAYER_W / 2, player.y - 6, '#3fe0d0', 2);
    }

    function hitPlayer(){
      if(player.invuln > 0) return;
      lives--;
      player.invuln = 90;
      hitFlash = 10;
      burst(player.x + PLAYER_W / 2, player.y, '#ff8a42', 16);
      if(lives <= 0){
        state = 'dead';
        if(score > best){ best = score; localStorage.setItem(STORAGE_KEY, String(best)); }
      }
    }

    function update(){
      frame++;
      if(fireTimer > 0) fireTimer--;
      if(player.invuln > 0) player.invuln--;
      if(hitFlash > 0) hitFlash--;

      if(state === 'playing'){
        // player movement
        const targetSpeed = PLAYER_SPEED;
        if(keys.left) player.x -= targetSpeed;
        if(keys.right) player.x += targetSpeed;
        if(pointerActive){
          const dx = pointerX - (player.x + PLAYER_W / 2);
          player.x += Math.max(-targetSpeed, Math.min(targetSpeed, dx * 0.3));
        }
        player.x = Math.max(10, Math.min(W - PLAYER_W - 10, player.x));

        if(keys.fire || pointerFire) fire();

        // alien formation movement
        const alive = aliens.filter((a) => a.alive);
        const aliveRatio = alive.length / aliens.length;
        const speedMul = 1 + (1 - aliveRatio) * 1.8;
        groupOffsetX += groupDir * groupSpeed * speedMul;

        let minX = Infinity, maxX = -Infinity;
        alive.forEach((a) => {
          const x = a.baseX + groupOffsetX;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x + ALIEN_W);
        });
        if(minX < 16 || maxX > W - 16){
          groupDir *= -1;
          groupOffsetX += groupDir * groupSpeed * speedMul * 2;
          groupDropY += 16;
        }

        // alien fire
        if(alive.length && frame % Math.max(18, 50 - wave * 2) === 0){
          const shooter = alive[Math.floor(Math.random() * alive.length)];
          alienBullets.push({
            x: shooter.baseX + groupOffsetX + ALIEN_W / 2,
            y: shooter.baseY + groupDropY + ALIEN_H,
          });
        }

        // bullets
        bullets.forEach((b) => { b.y -= BULLET_SPEED; });
        bullets = bullets.filter((b) => b.y > -20);
        alienBullets.forEach((b) => { b.y += 4.4; });
        alienBullets = alienBullets.filter((b) => b.y < H + 20);

        // bullet vs alien
        bullets.forEach((b) => {
          aliens.forEach((a) => {
            if(!a.alive) return;
            const ax = a.baseX + groupOffsetX, ay = a.baseY + groupDropY;
            if(b.x > ax - 4 && b.x < ax + ALIEN_W + 4 && b.y > ay - 4 && b.y < ay + ALIEN_H + 4){
              a.alive = false; b.y = -999;
              score += 10 + wave;
              burst(ax + ALIEN_W / 2, ay + ALIEN_H / 2, a.tier === 0 ? '#ff8a42' : '#3fe0d0', 10);
            }
          });
        });
        bullets = bullets.filter((b) => b.y > -20);

        // alien bullet vs player
        alienBullets.forEach((b) => {
          if(b.x > player.x && b.x < player.x + PLAYER_W && b.y > player.y && b.y < player.y + PLAYER_H){
            b.y = H + 999;
            hitPlayer();
          }
        });

        // alien reaches player row / collides
        aliens.forEach((a) => {
          if(!a.alive) return;
          const ay = a.baseY + groupDropY;
          if(ay + ALIEN_H > player.y) hitPlayer();
        });

        if(aliens.every((a) => !a.alive)) spawnWave();
      }

      particles.forEach((pt) => { pt.x += pt.vx; pt.y += pt.vy; pt.life--; });
      particles = particles.filter((pt) => pt.life > 0);
    }

    function drawGrid(){
      ctx.strokeStyle = 'rgba(237,242,247,0.05)';
      ctx.lineWidth = 1;
      for(let gx = 0; gx < W; gx += 32){ ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for(let gy = 0; gy < H; gy += 32){ ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    }

    function drawAlien(x, y, tier){
      const color = tier === 0 ? '#ff8a42' : '#3fe0d0';
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, ALIEN_W, ALIEN_H);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#04070a';
      ctx.fillRect(x + 5, y + 5, 5, 5);
      ctx.fillRect(x + ALIEN_W - 10, y + 5, 5, 5);
    }

    function drawPlayer(){
      if(player.invuln > 0 && Math.floor(frame / 4) % 2 === 0) return;
      const cx = player.x + PLAYER_W / 2;
      ctx.shadowColor = 'rgba(63,224,208,0.6)'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#3fe0d0';
      ctx.beginPath();
      ctx.moveTo(cx, player.y);
      ctx.lineTo(player.x, player.y + PLAYER_H);
      ctx.lineTo(player.x + PLAYER_W, player.y + PLAYER_H);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#04070a';
      ctx.fillRect(cx - 3, player.y + 8, 6, 6);
    }

    function draw(){
      ctx.fillStyle = hitFlash > 0 ? '#170a08' : '#04070a';
      ctx.fillRect(0, 0, W, H);
      drawGrid();

      aliens.forEach((a) => { if(a.alive) drawAlien(a.baseX + groupOffsetX, a.baseY + groupDropY, a.tier); });

      ctx.shadowColor = 'rgba(63,224,208,0.7)'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#3fe0d0';
      bullets.forEach((b) => { ctx.fillRect(b.x - 2, b.y - 8, 4, 12); });
      ctx.shadowBlur = 0;

      ctx.shadowColor = 'rgba(255,138,66,0.7)'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff8a42';
      alienBullets.forEach((b) => { ctx.fillRect(b.x - 2, b.y - 6, 4, 10); });
      ctx.shadowBlur = 0;

      particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life / 30);
        ctx.fillStyle = pt.c;
        ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
        ctx.globalAlpha = 1;
      });

      if(state !== 'dead') drawPlayer();

      // HUD
      ctx.textAlign = 'left';
      ctx.font = "600 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = '#edf2f7';
      ctx.fillText('SCORE ' + score, 16, 26);
      ctx.fillStyle = '#8a93a6';
      ctx.fillText('WAVE ' + wave, 16, 44);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#8a93a6';
      ctx.fillText('BEST ' + best, W - 16, 26);
      ctx.fillStyle = '#ff8a42';
      ctx.fillText('LIVES ' + Math.max(0, lives), W - 16, 44);
      ctx.textAlign = 'left';

      if(state === 'ready'){
        ctx.textAlign = 'center';
        drawAvatarBadge(ctx, W / 2, H / 2 - 96, 38);
        ctx.fillStyle = '#edf2f7';
        ctx.font = "700 22px 'Space Grotesk', sans-serif";
        ctx.fillText('ALIEN ONSLAUGHT', W / 2, H / 2 - 26);
        ctx.font = "500 12px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#8a93a6';
        ctx.fillText('ARROWS / A-D TO MOVE — SPACE TO FIRE', W / 2, H / 2 + 4);
        ctx.font = "500 10.5px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#5b6478';
        ctx.fillText(TAGLINE, W / 2, H / 2 + 26);
        ctx.textAlign = 'left';
      }
      if(state === 'dead'){
        ctx.fillStyle = 'rgba(5,7,10,0.62)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff8a42';
        ctx.font = "700 24px 'Space Grotesk', sans-serif";
        ctx.fillText('SWARM OVERRUN', W / 2, H / 2 - 20);
        ctx.fillStyle = '#edf2f7';
        ctx.font = "600 14px 'JetBrains Mono', monospace";
        ctx.fillText('SCORE ' + score + '   WAVE ' + wave + '   BEST ' + best, W / 2, H / 2 + 10);
        ctx.fillStyle = '#8a93a6';
        ctx.font = "500 12px 'JetBrains Mono', monospace";
        ctx.fillText('TAP TO RETRY', W / 2, H / 2 + 38);
        ctx.textAlign = 'left';
      }
    }

    function loop(){
      update();
      draw();
      animId = requestAnimationFrame(loop);
    }

    function onKeyDown(e){
      if(['ArrowLeft', 'a', 'A'].includes(e.key)) keys.left = true;
      if(['ArrowRight', 'd', 'D'].includes(e.key)) keys.right = true;
      if(e.code === 'Space'){ e.preventDefault(); keys.fire = true; start(); }
      if(state === 'ready' || state === 'dead') start();
    }
    function onKeyUp(e){
      if(['ArrowLeft', 'a', 'A'].includes(e.key)) keys.left = false;
      if(['ArrowRight', 'd', 'D'].includes(e.key)) keys.right = false;
      if(e.code === 'Space') keys.fire = false;
    }
    function canvasPoint(e){
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return (clientX - rect.left) * scaleX;
    }
    function onPointerDown(e){
      e.preventDefault();
      start();
      pointerActive = true; pointerFire = true;
      pointerX = canvasPoint(e);
    }
    function onPointerMove(e){
      if(!pointerActive) return;
      pointerX = canvasPoint(e);
    }
    function onPointerUp(){ pointerActive = false; pointerFire = false; }

    reset();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    animId = requestAnimationFrame(loop);

    return {
      destroy(){
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      },
    };
  }

  window.AlienShooterGame = { init };
})();
