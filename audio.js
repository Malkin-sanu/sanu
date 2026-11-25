/**
 * ====================================================================
 * 🎵 DREAMY BIRTHDAY AUDIO ENGINE
 * ====================================================================
 * Features:
 * - Autoplay policy compliance: gracefully starts on explicit user play or unlock.
 * - Supports custom audio file (assets/music/birthday-lofi.mp3, assets/music/birthday-lofi.wav).
 * - Full STOP and PAUSE controls with instant response and zero audio leakage.
 * - Persistent playback state across page navigation (respects user pause/stop).
 * - Built-in procedural Music Box / Kalimba lullaby synthesis via Web Audio API
 *   with dedicated gain routing, zero oscillator leaks, and instantaneous muting.
 * - Delightful cute sound effects (SFX): keypad clicks, unlock chime, envelope open, candle blow!
 */

class BirthdayAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.customAudio = null;
    this.isPlaying = false;
    this.usingProcedural = false;
    this.proceduralInterval = null;
    this.activeOscillators = [];
    this.hasUserInteracted = false;
    this.proceduralStep = 0;
    this.pendingResumeListeners = [];

    // Melody notes for procedural music box (Gentle, dreamy lullaby)
    this.melodySequence = [
      { note: 261.63, duration: 0.6, delay: 0 },    // C4
      { note: 329.63, duration: 0.6, delay: 0.4 },  // E4
      { note: 392.00, duration: 0.8, delay: 0.8 },  // G4
      { note: 523.25, duration: 1.2, delay: 1.4 },  // C5
      { note: 440.00, duration: 0.7, delay: 2.2 },  // A4
      { note: 392.00, duration: 0.9, delay: 2.8 },  // G4
      { note: 349.23, duration: 0.6, delay: 3.5 },  // F4
      { note: 329.63, duration: 1.2, delay: 4.0 },  // E4

      { note: 293.66, duration: 0.6, delay: 4.8 },  // D4
      { note: 329.63, duration: 0.6, delay: 5.2 },  // E4
      { note: 349.23, duration: 0.8, delay: 5.6 },  // F4
      { note: 392.00, duration: 1.2, delay: 6.2 },  // G4
      { note: 440.00, duration: 0.6, delay: 7.0 },  // A4
      { note: 523.25, duration: 1.4, delay: 7.5 },  // C5
      { note: 493.88, duration: 0.8, delay: 8.5 },  // B4
      { note: 523.25, duration: 2.0, delay: 9.2 }   // C5
    ];
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();

        // Master gain
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);

        // Music dedicated gain (can be muted immediately on pause/stop)
        this.musicGain = this.audioCtx.createGain();
        this.musicGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
        this.musicGain.connect(this.masterGain);

        // SFX dedicated gain (stays active even if music is paused/stopped)
        this.sfxGain = this.audioCtx.createGain();
        this.sfxGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  init() {
    // Check DOM for <audio id="bgMusic"> first, or instantiate new Audio
    const existingAudio = document.getElementById('bgMusic');
    const audioPath = (window.BIRTHDAY_CONFIG && window.BIRTHDAY_CONFIG.music && window.BIRTHDAY_CONFIG.music.customAudioPath) 
      ? window.BIRTHDAY_CONFIG.music.customAudioPath 
      : 'assets/music/birthday-lofi.mp3';

    if (existingAudio) {
      this.customAudio = existingAudio;
    } else {
      try {
        this.customAudio = new Audio(audioPath);
        this.customAudio.id = 'bgMusic';
      } catch (e) {
        this.usingProcedural = true;
      }
    }

    if (this.customAudio) {
      this.customAudio.loop = true;
      this.customAudio.volume = 0.55;

      // Keep UI in sync with native audio element events
      this.customAudio.addEventListener('pause', () => {
        if (!this.usingProcedural) {
          this.isPlaying = false;
          this.updateUiState();
        }
      });
      this.customAudio.addEventListener('play', () => {
        if (!this.usingProcedural) {
          this.isPlaying = true;
          this.updateUiState();
        }
      });
      this.customAudio.addEventListener('error', () => {
        // Fall back to procedural music box if file cannot be loaded
        this.usingProcedural = true;
        if (this.isPlaying) {
          this.startProceduralMelody();
        }
      });
    }

    // Check saved state from previous page
    let savedState = null;
    try {
      savedState = sessionStorage.getItem('birthday_music_state');
    } catch (e) {}

    // Unlock AudioContext on first user gesture (for SFX, clicks, etc.)
    const unlockCtx = () => {
      this.hasUserInteracted = true;
      this.ensureAudioContext();
    };
    ['click', 'keydown', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, unlockCtx, { once: true, passive: true });
    });

    // Cross-page navigation handling:
    // If user previously paused or stopped, DO NOT auto-play and DO NOT attach any resume listeners!
    if (savedState === 'paused') {
      this.isPlaying = false;
      if (this.customAudio) this.customAudio.pause();
      this.updateUiState();
      return;
    }

    if (savedState === 'stopped') {
      this.isPlaying = false;
      if (this.customAudio) {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      }
      this.updateUiState();
      return;
    }

    if (savedState === 'playing') {
      // Music was actively playing before navigating to this page.
      // Attempt to continue playback seamlessly.
      const tryAutoResume = () => {
        const curr = sessionStorage.getItem('birthday_music_state');
        if (curr === 'paused' || curr === 'stopped') {
          return;
        }
        this.playMusic();
      };

      // Try immediate playback
      const playPromise = this.playMusic();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
          // Autoplay policy prevented immediate play, attach one-shot interaction listener
          const resumeOnGesture = (e) => {
            if (e && e.target && (e.target.closest('#musicToggleBtn') || e.target.closest('#musicStopBtn'))) {
              return;
            }
            const curr = sessionStorage.getItem('birthday_music_state');
            if (curr === 'paused' || curr === 'stopped') {
              return;
            }
            this.playMusic();
            this.removePendingResumeListeners();
          };

          this.addPendingResumeListener('click', resumeOnGesture);
          this.addPendingResumeListener('keydown', resumeOnGesture);
          this.addPendingResumeListener('touchstart', resumeOnGesture);
        });
      }
    } else {
      // No saved state (fresh session on index.html)
      this.updateUiState();
    }
  }

  addPendingResumeListener(type, handler) {
    document.addEventListener(type, handler, { once: true });
    this.pendingResumeListeners.push({ type, handler });
  }

  removePendingResumeListeners() {
    this.pendingResumeListeners.forEach(({ type, handler }) => {
      document.removeEventListener(type, handler);
    });
    this.pendingResumeListeners = [];
  }

  async playMusic() {
    // If already playing, do not spawn another instance
    if (this.isPlaying) {
      this.updateUiState();
      return;
    }

    this.ensureAudioContext();
    this.removePendingResumeListeners();

    this.isPlaying = true;
    try {
      sessionStorage.setItem('birthday_music_state', 'playing');
      sessionStorage.setItem('birthday_music_playing', 'true');
    } catch (e) {}

    // Make sure music gain is unmuted
    if (this.musicGain && this.audioCtx) {
      this.musicGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.musicGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
    }

    // Try custom audio first if not flagged procedural
    if (this.customAudio && !this.usingProcedural) {
      try {
        // Stop procedural if running
        this.stopProceduralMelody();
        await this.customAudio.play();
        this.usingProcedural = false;
        this.updateUiState();
        return;
      } catch (err) {
        // Custom audio play failed (e.g. autoplay restriction or 404), fallback to procedural
        if (!this.isPlaying) return; // aborted in between
        this.usingProcedural = true;
      }
    }

    // Play procedural melody
    this.usingProcedural = true;
    this.startProceduralMelody();
    this.updateUiState();
  }

  pauseMusic() {
    this.isPlaying = false;
    this.removePendingResumeListeners();

    try {
      sessionStorage.setItem('birthday_music_state', 'paused');
      sessionStorage.setItem('birthday_music_playing', 'false');
    } catch (e) {}

    // 1. Immediately pause HTML5 audio element
    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch (e) {}
    }

    // 2. Immediately stop & mute all procedural oscillators & scheduled notes
    this.stopProceduralMelody();

    this.updateUiState();
  }

  stopMusic() {
    this.isPlaying = false;
    this.removePendingResumeListeners();

    try {
      sessionStorage.setItem('birthday_music_state', 'stopped');
      sessionStorage.setItem('birthday_music_playing', 'false');
    } catch (e) {}

    // 1. Immediately pause and reset HTML5 audio element to beginning
    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      } catch (e) {}
    }

    // 2. Immediately stop procedural melody and reset note index to 0
    this.stopProceduralMelody();
    this.proceduralStep = 0;

    this.updateUiState();
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  stopProceduralMelody() {
    // Clear scheduled interval loop
    if (this.proceduralInterval) {
      clearInterval(this.proceduralInterval);
      this.proceduralInterval = null;
    }

    // Instantly mute music gain node to cancel all pre-scheduled notes
    if (this.musicGain && this.audioCtx) {
      this.musicGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.musicGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }

    // Immediately stop and disconnect all active oscillators
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }

  startProceduralMelody() {
    this.stopProceduralMelody();
    if (!this.isPlaying) return;

    this.ensureAudioContext();
    if (!this.audioCtx) return;

    // Unmute music gain
    if (this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.musicGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
    }

    const loopLengthSeconds = 11.5;
    const playLoop = () => {
      if (!this.isPlaying || !this.audioCtx || this.audioCtx.state !== 'running') return;
      const now = this.audioCtx.currentTime;

      this.melodySequence.forEach(item => {
        this.scheduleMusicBoxChime(item.note, now + item.delay, item.duration);
        if (item.delay % 2 === 0) {
          this.scheduleWarmBass(item.note / 2, now + item.delay, 1.5);
        }
      });
    };

    playLoop();
    this.proceduralInterval = setInterval(playLoop, loopLengthSeconds * 1000);
  }

  scheduleMusicBoxChime(freq, time, duration = 0.8) {
    if (!this.audioCtx || this.audioCtx.state !== 'running' || !this.isPlaying) return;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, time);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.exponentialRampToValueAtTime(0.22, time + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.musicGain || this.masterGain || this.audioCtx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.1);
    osc2.stop(time + duration + 0.1);

    this.activeOscillators.push(osc1, osc2);

    // Clean up oscillator references once stopped
    setTimeout(() => {
      const idx1 = this.activeOscillators.indexOf(osc1);
      if (idx1 !== -1) this.activeOscillators.splice(idx1, 1);
      const idx2 = this.activeOscillators.indexOf(osc2);
      if (idx2 !== -1) this.activeOscillators.splice(idx2, 1);
    }, (duration + 0.2) * 1000);
  }

  scheduleWarmBass(freq, time, duration = 1.2) {
    if (!this.audioCtx || this.audioCtx.state !== 'running' || !this.isPlaying) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.12, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain || this.masterGain || this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.1);

    this.activeOscillators.push(osc);
    setTimeout(() => {
      const idx = this.activeOscillators.indexOf(osc);
      if (idx !== -1) this.activeOscillators.splice(idx, 1);
    }, (duration + 0.2) * 1000);
  }

  // SFX connect to sfxGain / destination so they work regardless of music state!
  playKeypadClick(digit) {
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
    const freq = notes[parseInt(digit, 10) % notes.length] || 440;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.12);
  }

  playErrorSound() {
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.25);
  }

  playUnlockSuccess() {
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const now = this.audioCtx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50];

    arpeggio.forEach((f, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.1);

      gain.gain.setValueAtTime(0.001, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.audioCtx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.45);
    });
  }

  playCandleBlow() {
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const bufferSize = this.audioCtx.sampleRate * 0.5;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.5);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.audioCtx.destination);

    noise.start();
  }

  updateUiState() {
    const toggleBtn = document.getElementById('musicToggleBtn');
    const stopBtn = document.getElementById('musicStopBtn');
    let state = 'stopped';
    try {
      state = sessionStorage.getItem('birthday_music_state') || (this.isPlaying ? 'playing' : 'stopped');
    } catch (e) {
      state = this.isPlaying ? 'playing' : 'stopped';
    }

    if (toggleBtn) {
      if (this.isPlaying) {
        toggleBtn.classList.add('playing');
        toggleBtn.setAttribute('aria-label', 'Pause background music');
        toggleBtn.title = 'Pause background music';
        toggleBtn.innerHTML = `
          <span class="music-icon-disc spinning">💿</span>
          <span class="music-notes-anim">🎵</span>
        `;
      } else {
        toggleBtn.classList.remove('playing');
        if (state === 'paused') {
          toggleBtn.setAttribute('aria-label', 'Resume background music');
          toggleBtn.title = 'Resume background music';
          toggleBtn.innerHTML = `
            <span class="music-icon-disc">⏸️</span>
          `;
        } else {
          toggleBtn.setAttribute('aria-label', 'Play background music');
          toggleBtn.title = 'Play background music';
          toggleBtn.innerHTML = `
            <span class="music-icon-disc">🔇</span>
          `;
        }
      }
    }

    if (stopBtn) {
      if (this.isPlaying) {
        stopBtn.classList.add('can-stop');
        stopBtn.setAttribute('aria-label', 'Stop background music');
        stopBtn.title = 'Stop background music';
      } else {
        stopBtn.classList.remove('can-stop');
        stopBtn.setAttribute('aria-label', 'Music stopped');
        stopBtn.title = 'Music stopped';
      }
    }
  }
}

// Global audio singleton
window.birthdayAudio = new BirthdayAudioEngine();
window.playMusic = () => window.birthdayAudio.playMusic();
window.pauseMusic = () => window.birthdayAudio.pauseMusic();
window.stopMusic = () => window.birthdayAudio.stopMusic();
window.toggleMusic = () => window.birthdayAudio.toggleMusic();
