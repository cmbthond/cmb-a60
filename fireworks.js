(() => {
  const palette = ['#ffffff', '#55efff', '#2c8cff', '#8a5cff', '#ffd35a'];
  const random = (min, max) => Math.random() * (max - min) + min;
  const activeEffects = new WeakMap();
  window.stopFireworks = (root) => activeEffects.get(root)?.();

  window.startFireworks = (root) => {
    if (!root || activeEffects.has(root)) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'fireworks-layer';
    Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: '20', pointerEvents: 'none' });
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const rect = root.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * devicePixelRatio));
    canvas.height = Math.max(1, Math.round(rect.height * devicePixelRatio));
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const particles = [];
    let running = true;

    function burst(x, y) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const scale = Math.max(1, Math.min(rect.width, rect.height) / 720);
      for (let i = 0; i < 150; i++) {
        const angle = Math.PI * 2 * i / 150 + random(-0.05, 0.05);
        const speed = random(2.2, 8.6) * scale;
        particles.push({ x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: random(1.05, 1.7), color });
      }
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.018; p.px = p.x; p.py = p.y; p.vy += 0.055; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.strokeStyle = p.color; ctx.globalAlpha = Math.min(1, p.life * 1.8); ctx.lineWidth = 2.35;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    const launch = () => burst(random(rect.width * 0.12, rect.width * 0.88), random(rect.height * 0.14, rect.height * 0.5));
    launch(); setTimeout(launch, 220); setTimeout(launch, 480); setTimeout(launch, 760); setTimeout(launch, 1040);
    const launchTimer = setInterval(launch, 620);
    activeEffects.set(root, () => { running = false; clearInterval(launchTimer); canvas.remove(); activeEffects.delete(root); });
    draw();
  };
})();
