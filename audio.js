/**
 * ====================================================================
 * 🎵 DREAMY BIRTHDAY AUDIO ENGINE
 * ====================================================================
 * Features:
 * - Autoplay policy compliance: gracefully starts on first user touch/click.
 * - Supports custom MP3 file (e.g. assets/music/birthday-lofi.mp3).
 * - Built-in procedural Music Box / Kalimba lullaby synthesis via Web Audio API
 *   so the website ALWAYS has gorgeous, relaxing background music even with 0 external files!
 * - Delightful cute sound effects (SFX): keypad clicks, unlock chime, envelope open, candle blow!
 */

class BirthdayAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.customAudio = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.usingProcedural = false;
    this.proceduralInterval = null;
    this.masterGain = null;
    this.hasUserInteracted = false;

    // Melody notes for procedural music box (Gentle, dreamy lullaby)
    // C4, D4, E4, G4, A4, C5, D5, E5 pentatonic & Happy Birthday chords
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

  init() {
    // Try to load custom audio if configured
    if (window.BIRTHDAY_CONFIG && window.BIRTHDAY_CONFIG.music && window.BIRTHDAY_CONFIG.music.customAudioPath) {
      try {
        this.customAudio = new Audio(window.BIRTHDAY_CONFIG.music.customAudioPath);
        this.customAudio.loop = true;
        this.customAudio.volume = 0.55;

        // Verify if file actually exists and can play
        this.customAudio.addEventListener('error', () => {
          console.info("Custom MP3 not found. Switching to built-in dreamy music box chime.");
          this.usingProcedural = true;
        });
      } catch (e) {
        this.usingProcedural = true;
      }
    } else {
      this.usingProcedural = true;
    }

    // Set up first-interaction listener
    const unlockAudio = () => {
      this.hasUserInteracted = true;
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.masterGain = this.audioCtx.createGain();
          this.masterGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
          this.masterGain.connect(this.audioCtx.destination);
        }
      } else if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });

    // Check if music was already active on previous page
    try {
      if (sessionStorage.getItem('birthday_music_playing') === 'true') {
        const resumeAudio = () => {
          this.playMusic();
        };
        document.addEventListener('click', resumeAudio, { once: true });
        document.addEventListener('keydown', resumeAudio, { once: true });
        document.addEventListener('touchstart', resumeAudio, { once: true });
        // Attempt immediate playback in case user gesture carries over
        this.playMusic();
      }
    } catch (e) {}
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playMusic() {
    this.ensureAudioContext();
    this.isPlaying = true;
    this.isMuted = false;
    try {
      sessionStorage.setItem('birthday_music_playing', 'true');
    } catch (e) {}

    // Check if custom audio is loaded and playable
    if (this.customAudio && !this.usingProcedural) {
      const playPromise = this.customAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.usingProcedural = false;
            this.updateUiState();
          })
          .catch(() => {
            // Autoplay rejected or 404, fallback to procedural music box
            this.usingProcedural = true;
            this.startProceduralMelody();
            this.updateUiState();
          });
      }
    } else {
      this.usingProcedural = true;
      this.startProceduralMelody();
      this.updateUiState();
    }
  }

  pauseMusic() {
    this.isPlaying = false;
    try {
      sessionStorage.setItem('birthday_music_playing', 'false');
    } catch (e) {}
    if (this.customAudio) {
      this.customAudio.pause();
    }
    if (this.proceduralInterval) {
      clearInterval(this.proceduralInterval);
      this.proceduralInterval = null;
    }
    this.updateUiState();
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  startProceduralMelody() {
    if (this.proceduralInterval) {
      clearInterval(this.proceduralInterval);
    }

    const loopLengthSeconds = 11.5;
    const playLoop = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      
      const now = this.audioCtx.currentTime;
      this.melodySequence.forEach(item => {
        this.scheduleMusicBoxChime(item.note, now + item.delay, item.duration);
        // Play gentle sub-bass / root note
        if (item.delay % 2 === 0) {
          this.scheduleWarmBass(item.note / 2, now + item.delay, 1.5);
        }
      });
    };

    playLoop();
    this.proceduralInterval = setInterval(playLoop, loopLengthSeconds * 1000);
  }

  scheduleMusicBoxChime(freq, time, duration = 0.8) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    // Primary bell tone
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    // Harmonic bell shimmer
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, time);

    // Envelope: quick attack, sparkling natural decay
    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.exponentialRampToValueAtTime(0.22, time + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.1);
    osc2.stop(time + duration + 0.1);
  }

  scheduleWarmBass(freq, time, duration = 1.2) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.12, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  // Cute SFX for Keypad clicks
  playKeypadClick(digit) {
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
    const freq = notes[parseInt(digit) % notes.length] || 440;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.12);
  }

  // Cute error boop
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
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.25);
  }

  // Magical unlock fanfare
  playUnlockSuccess() {
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const now = this.audioCtx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    arpeggio.forEach((f, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.1);

      gain.gain.setValueAtTime(0.001, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.45);
    });
  }

  // Candle blow swoosh sound
  playCandleBlow() {
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    // Soft gentle breath puff / white noise
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
    gain.connect(this.audioCtx.destination);

    noise.start();
  }

  updateUiState() {
    const btn = document.getElementById('musicToggleBtn');
    if (!btn) return;

    if (this.isPlaying) {
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Mute background music');
      btn.innerHTML = `
        <span class="music-icon-disc spinning">💿</span>
        <span class="music-notes-anim">🎵</span>
      `;
    } else {
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Play background music');
      btn.innerHTML = `
        <span class="music-icon-disc">🔇</span>
      `;
    }
  }
}

// Global audio singleton
window.birthdayAudio = new BirthdayAudioEngine();
