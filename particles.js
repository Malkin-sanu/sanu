/**
 * ====================================================================
 * ✨ DREAMY PARTICLES & FLOATING HEARTS ENGINE
 * ====================================================================
 * High-performance 60FPS canvas system for:
 * - Ambient floating hearts, sparkles, and gentle stars.
 * - Tap/Click micro-bursts of cute mini hearts.
 * - Confetti cannon explosions for unlocks and blowing birthday candles!
 * - Floating pastel balloons for the grand finale.
 */

class ParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.ambientParticles = [];
    this.burstParticles = [];
    this.balloons = [];
    this.isRunning = true;
    this.maxAmbient = 32;

    this.heartColors = ['#ff758f', '#ff4d6d', '#ff85a1', '#ffb3c6', '#ffd166', '#ffcbf2', '#f72585'];
  }

  init() {
    this.canvas = document.getElementById('particleCanvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'particleCanvas';
      this.canvas.className = 'particle-canvas-layer';
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => this.resize());

    // Spawn initial ambient floating hearts
    for (let i = 0; i < this.maxAmbient; i++) {
      this.ambientParticles.push(this.createAmbientParticle(true));
    }

    // Interactive click / tap sparkler
    window.addEventListener('pointerdown', (e) => {
      // Don't burst on keypad clicks to avoid clutter, or do a gentle burst
      this.burstAt(e.clientX, e.clientY, 8);
    }, { passive: true });

    // Visibility change: pause rendering when tab is inactive to save battery
    document.addEventListener('visibilitychange', () => {
      this.isRunning = !document.hidden;
      if (this.isRunning) {
        requestAnimationFrame((ts) => this.render(ts));
      }
    });

    requestAnimationFrame((ts) => this.render(ts));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createAmbientParticle(randomY = false) {
    const isHeart = Math.random() > 0.45;
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 20,
      size: isHeart ? (Math.random() * 12 + 10) : (Math.random() * 4 + 3),
      speedY: Math.random() * 0.7 + 0.35,
      speedX: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.55 + 0.25,
      color: this.heartColors[Math.floor(Math.random() * this.heartColors.length)],
      isHeart: isHeart,
      swayOffset: Math.random() * Math.PI * 2
    };
  }

  burstAt(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      const isHeart = Math.random() > 0.5;
      this.burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        gravity: 0.08,
        size: isHeart ? Math.random() * 10 + 8 : Math.random() * 4 + 2,
        color: this.heartColors[Math.floor(Math.random() * this.heartColors.length)],
        isHeart: isHeart,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.02
      });
    }
  }

  // Grand Confetti Blast for Unlock & Candle Blow
  triggerConfettiBlast() {
    const blastCount = 90;
    const origins = [
      { x: this.width * 0.2, y: this.height * 0.8 },
      { x: this.width * 0.5, y: this.height * 0.6 },
      { x: this.width * 0.8, y: this.height * 0.8 }
    ];

    origins.forEach(orig => {
      for (let i = 0; i < blastCount / 3; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const speed = Math.random() * 10 + 5;
        const isHeart = Math.random() > 0.4;
        this.burstParticles.push({
          x: orig.x,
          y: orig.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.12,
          size: isHeart ? Math.random() * 14 + 10 : Math.random() * 8 + 4,
          color: this.heartColors[Math.floor(Math.random() * this.heartColors.length)],
          isHeart: isHeart,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
          life: 1.0,
          decay: Math.random() * 0.012 + 0.008
        });
      }
    });
  }

  // Floating Balloons on Page 5
  spawnBalloons() {
    const balloonColors = ['#ff758f', '#ffb3c6', '#ffd166', '#a2d2ff', '#cdb4db', '#ffc8dd'];
    for (let i = 0; i < 18; i++) {
      this.balloons.push({
        x: Math.random() * this.width,
        y: this.height + Math.random() * 200 + 40,
        size: Math.random() * 25 + 30, // balloon radius
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        speedY: Math.random() * 1.2 + 0.7,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        stringLength: 45
      });
    }
  }

  drawHeart(ctx, x, y, size, color, opacity, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 20, size / 20);
    ctx.globalAlpha = Math.max(0, opacity);
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -10, -15, 5, 0, 16);
    ctx.bezierCurveTo(15, 5, 10, -10, 0, 0);
    ctx.fill();

    ctx.restore();
  }

  drawSparkle(ctx, x, y, size, color, opacity, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, opacity);
    ctx.fillStyle = color;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(0, -size);
      ctx.lineTo(size * 0.25, -size * 0.25);
      ctx.rotate(Math.PI / 2);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawBalloon(ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    // Balloon String
    ctx.beginPath();
    ctx.moveTo(0, b.size);
    ctx.bezierCurveTo(-5, b.size + 15, 8, b.size + 30, 0, b.size + b.stringLength);
    ctx.strokeStyle = '#ffb3c6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Balloon Body
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.size * 0.75, b.size, 0, 0, Math.PI * 2);
    ctx.fill();

    // Balloon Tie knot
    ctx.beginPath();
    ctx.moveTo(-4, b.size);
    ctx.lineTo(4, b.size);
    ctx.lineTo(0, b.size + 5);
    ctx.closePath();
    ctx.fill();

    // Balloon Gloss Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-b.size * 0.3, -b.size * 0.3, b.size * 0.16, b.size * 0.3, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  render(timestamp) {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Render Ambient Floating Hearts
    for (let i = 0; i < this.ambientParticles.length; i++) {
      const p = this.ambientParticles[i];
      p.y -= p.speedY;
      p.x += Math.sin(p.y * 0.01 + p.swayOffset) * 0.5 + p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y < -30) {
        // Recycle to bottom
        p.y = this.height + 20;
        p.x = Math.random() * this.width;
      }

      if (p.isHeart) {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      } else {
        this.drawSparkle(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      }
    }

    // 2. Render Burst & Confetti Particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const p = this.burstParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }

      if (p.isHeart) {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.life, p.rotation);
      } else {
        this.drawSparkle(this.ctx, p.x, p.y, p.size, p.color, p.life, p.rotation);
      }
    }

    // 3. Render Floating Balloons
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      b.y -= b.speedY;
      b.x += Math.sin(b.y * b.swaySpeed + b.swayOffset) * 0.8;

      if (b.y < -100) {
        // Recycle balloon
        b.y = this.height + 80;
        b.x = Math.random() * this.width;
      }

      this.drawBalloon(this.ctx, b);
    }

    requestAnimationFrame((ts) => this.render(ts));
  }
}

// Global particle engine instance
window.particleEngine = new ParticleEngine();
