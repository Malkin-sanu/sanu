/**
 * ====================================================================
 * 🎂 BIRTHDAY WEBSITE MAIN APPLICATION CONTROLLER
 * ====================================================================
 * Supports multi-page architecture:
 * - index.html   : Age Lock Screen
 * - letter.html  : Birthday Envelope & Letter
 * - reasons.html : Why I Like You Cards
 * - gallery.html : Polaroid Gallery & Lightbox
 * - final.html   : Grand Birthday Surprise & Cake
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.BIRTHDAY_CONFIG;
  if (!config) {
    console.error("Configuration 'BIRTHDAY_CONFIG' not found in window.");
    return;
  }

  // --- Page Detection & State ---
  const currentPath = window.location.pathname.toLowerCase();
  const isIndexPage = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
  const isLetterPage = currentPath.endsWith('letter.html');
  const isReasonsPage = currentPath.endsWith('reasons.html');
  const isGalleryPage = currentPath.endsWith('gallery.html');
  const isFinalPage = currentPath.endsWith('final.html');

  // Check unlock status from sessionStorage
  let isUnlocked = false;
  try {
    isUnlocked = sessionStorage.getItem('birthday_unlocked') === 'true';
  } catch (e) {
    isUnlocked = false;
  }

  // Guard: If accessing inner pages directly before age lock, redirect to index.html
  if (!isIndexPage && !isUnlocked) {
    window.location.replace('index.html');
    return;
  }

  let enteredDigits = [];
  let revealedReasonsCount = 0;
  let currentLightboxIndex = 0;
  let slideshowTimer = null;
  let isSlideshowActive = false;
  let areCandlesBlown = false;

  // Initialize Audio & Particle Engine
  window.birthdayAudio.init();
  window.particleEngine.init();

  // Floating Music Controls (Play/Pause, Stop, dedicated Pause/Play)
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.birthdayAudio.toggleMusic();
    });
  }

  const musicStopBtn = document.getElementById('musicStopBtn');
  if (musicStopBtn) {
    musicStopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.birthdayAudio.stopMusic();
    });
  }

  const musicPauseBtn = document.getElementById('musicPauseBtn');
  if (musicPauseBtn) {
    musicPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.birthdayAudio.pauseMusic();
    });
  }

  const musicPlayBtn = document.getElementById('musicPlayBtn');
  if (musicPlayBtn) {
    musicPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.birthdayAudio.playMusic();
    });
  }

  // Navigation track unlock state
  const navTrack = document.getElementById('navTrack');
  if (navTrack && isUnlocked) {
    navTrack.classList.remove('locked');
  }

  // Navigation dots click validation
  const navDots = document.querySelectorAll('.nav-dot');
  navDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const step = parseInt(dot.getAttribute('data-step'), 10);
      if (step > 1 && !isUnlocked) {
        e.preventDefault();
        showFeedback("Unlock with your age first! 🔐", false);
      }
    });
  });

  // ----------------------------------------------------
  // PAGE 1: AGE LOCK SCREEN LOGIC (index.html)
  // ----------------------------------------------------
  const digitBox1 = document.getElementById('digitBox1');
  const digitBox2 = document.getElementById('digitBox2');
  const ageFeedback = document.getElementById('ageFeedback');
  const unlockBtn = document.getElementById('unlockBtn');
  const keypadButtons = document.querySelectorAll('.keypad-btn');

  // Populate dynamic text from config
  const agePromptTitle = document.getElementById('agePromptTitle');
  const agePromptSubtitle = document.getElementById('agePromptSubtitle');
  if (agePromptTitle) agePromptTitle.textContent = config.agePromptTitle;
  if (agePromptSubtitle) agePromptSubtitle.textContent = config.agePromptSubtitle;

  function updateDigitBoxes() {
    if (digitBox1) {
      digitBox1.textContent = enteredDigits[0] !== undefined ? enteredDigits[0] : '';
      digitBox1.classList.toggle('filled', enteredDigits[0] !== undefined);
      digitBox1.classList.toggle('active', enteredDigits.length === 0);
    }
    if (digitBox2) {
      digitBox2.textContent = enteredDigits[1] !== undefined ? enteredDigits[1] : '';
      digitBox2.classList.toggle('filled', enteredDigits[1] !== undefined);
      digitBox2.classList.toggle('active', enteredDigits.length === 1);
    }
  }

  function handleKeypadInput(val) {
    if (val === 'backspace' || val === '⌫' || val === '#') {
      if (enteredDigits.length > 0) {
        enteredDigits.pop();
        window.birthdayAudio.playKeypadClick(4);
        clearFeedback();
        updateDigitBoxes();
      }
      return;
    }

    if (val === 'clear' || val === '*') {
      enteredDigits = [];
      window.birthdayAudio.playKeypadClick(1);
      clearFeedback();
      updateDigitBoxes();
      return;
    }

    // Number digit entered (0-9)
    if (/^[0-9]$/.test(val)) {
      if (enteredDigits.length < 2) {
        enteredDigits.push(val);
        window.birthdayAudio.playKeypadClick(val);
        updateDigitBoxes();

        // If 2 digits reached, provide a short pause then auto-check
        if (enteredDigits.length === 2) {
          setTimeout(() => {
            attemptUnlock();
          }, 350);
        }
      }
    }
  }

  function clearFeedback() {
    if (ageFeedback) {
      ageFeedback.textContent = '';
      ageFeedback.className = 'age-feedback';
    }
  }

  function showFeedback(msg, isSuccess = false) {
    if (!ageFeedback) return;
    ageFeedback.textContent = msg;
    ageFeedback.className = `age-feedback ${isSuccess ? 'success' : 'error'}`;
  }

  function attemptUnlock() {
    if (enteredDigits.length < 2) {
      showFeedback("Please enter your 2-digit age 🎂", false);
      window.birthdayAudio.playErrorSound();
      shakeInputs();
      return;
    }

    const enteredAge = enteredDigits.join('');
    if (enteredAge === config.correctAge) {
      // SUCCESS!
      isUnlocked = true;
      try {
        sessionStorage.setItem('birthday_unlocked', 'true');
      } catch (e) {}

      showFeedback(config.ageSuccessMessage, true);
      window.birthdayAudio.playUnlockSuccess();
      window.particleEngine.triggerConfettiBlast();

      if (digitBox1) digitBox1.classList.add('success-glow');
      if (digitBox2) digitBox2.classList.add('success-glow');
      if (unlockBtn) {
        unlockBtn.classList.add('success');
        unlockBtn.innerHTML = '<span>UNLOCKED! 💖</span>';
      }

      // Automatically start dreamy music only if user has not explicitly paused or stopped it
      let savedMusicState = null;
      try {
        savedMusicState = sessionStorage.getItem('birthday_music_state');
      } catch (e) {}
      if (savedMusicState !== 'paused' && savedMusicState !== 'stopped') {
        window.birthdayAudio.playMusic();
      }

      // Show nav track once unlocked
      if (navTrack) {
        navTrack.classList.remove('locked');
      }

      // Smoothly navigate to letter.html after celebrate animation
      setTimeout(() => {
        window.location.href = 'letter.html';
      }, 1200);

    } else {
      // WRONG AGE
      showFeedback(config.ageErrorMessage, false);
      window.birthdayAudio.playErrorSound();
      shakeInputs();

      // Clear after short delay so user can re-try
      setTimeout(() => {
        enteredDigits = [];
        updateDigitBoxes();
      }, 900);
    }
  }

  function shakeInputs() {
    const container = document.getElementById('ageInputsRow');
    if (container) {
      container.classList.remove('shake-anim');
      void container.offsetWidth; // trigger reflow
      container.classList.add('shake-anim');
      setTimeout(() => container.classList.remove('shake-anim'), 600);
    }
  }

  // Keypad button click handlers
  keypadButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.getAttribute('data-val');
      handleKeypadInput(val);
    });
  });

  if (unlockBtn) {
    unlockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      attemptUnlock();
    });
  }

  // Physical keyboard support for desktop visitors on index.html
  if (digitBox1) {
    window.addEventListener('keydown', (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeypadInput(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleKeypadInput('backspace');
      } else if (e.key === 'Enter') {
        attemptUnlock();
      }
    });
  }

  // ----------------------------------------------------
  // PAGE 2: ANIMATED BIRTHDAY LETTER LOGIC (letter.html)
  // ----------------------------------------------------
  const envelope = document.getElementById('birthdayEnvelope');
  const letterPaper = document.getElementById('letterPaper');
  const letterSealBtn = document.getElementById('letterSealBtn');
  const letterBodyContainer = document.getElementById('letterBodyContainer');

  // Fill Letter Text from config
  const letterSalutation = document.getElementById('letterSalutation');
  const letterClosing = document.getElementById('letterClosing');
  const letterSignature = document.getElementById('letterSignature');

  if (letterSalutation) letterSalutation.textContent = config.letter.salutation;
  if (letterClosing) letterClosing.textContent = config.letter.closing;
  if (letterSignature) letterSignature.textContent = config.letter.signature;

  if (letterBodyContainer && config.letter.paragraphs) {
    letterBodyContainer.innerHTML = config.letter.paragraphs
      .map(p => `<p class="letter-paragraph">${p}</p>`)
      .join('');
  }

  function openEnvelope() {
    if (!envelope) return;
    if (envelope.classList.contains('envelope-open')) return;

    envelope.classList.add('envelope-open');
    envelope.setAttribute('aria-expanded', 'true');
    if (window.particleEngine && typeof window.particleEngine.burstAt === 'function') {
      window.particleEngine.burstAt(window.innerWidth / 2, window.innerHeight * 0.45, 20);
    }

    // After flap opens, slide and expand letter
    setTimeout(() => {
      if (letterPaper) {
        letterPaper.classList.add('unfolded');
      }
      envelope.classList.add('envelope-unfolded');
    }, 600);
  }

  if (envelope) {
    envelope.addEventListener('click', (e) => {
      // If clicking inside letter buttons or links, don't trigger envelope toggle
      if (e.target.closest('a') || e.target.closest('button')) return;
      openEnvelope();
    });
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a') || e.target.closest('button')) return;
        e.preventDefault();
        openEnvelope();
      }
    });
  }

  if (letterSealBtn) {
    letterSealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
    letterSealBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        openEnvelope();
      }
    });
  }

  // ----------------------------------------------------
  // PAGE 3: "WHY DO I LIKE YOU?" REASONS LOGIC (reasons.html)
  // ----------------------------------------------------
  const reasonsGrid = document.getElementById('reasonsGrid');
  const revealedBadge = document.getElementById('revealedBadge');
  const revealAllBtn = document.getElementById('revealAllBtn');
  const reasonsFinalMessage = document.getElementById('reasonsFinalMessage');
  const finalMessageText = document.getElementById('finalMessageText');

  if (finalMessageText && config.reasonsClosingMessage) {
    finalMessageText.textContent = `“${config.reasonsClosingMessage}”`;
  }

  if (reasonsGrid && config.reasons) {
    reasonsGrid.innerHTML = config.reasons.map((reason, index) => `
      <div class="reason-card" data-reason-id="${reason.id}" style="--card-index: ${index};" tabindex="0" role="button" aria-expanded="false">
        <div class="reason-card-inner">
          <!-- Card Front (Cover) -->
          <div class="reason-card-front">
            <div class="reason-cover-ribbon">💝</div>
            <div class="reason-cover-num">Reason #${reason.id}</div>
            <div class="reason-cover-hint">Tap to reveal 💌</div>
            <div class="reason-sparkle-icon">✨</div>
          </div>
          <!-- Card Back (Revealed Content) -->
          <div class="reason-card-back">
            <div class="reason-header">
              <span class="reason-emoji">${reason.icon}</span>
              <span class="reason-tag">${reason.tag}</span>
            </div>
            <h3 class="reason-title">${reason.title}</h3>
            <p class="reason-desc">${reason.description}</p>
            <div class="reason-bottom-heart">💕</div>
          </div>
        </div>
      </div>
    `).join('');

    // Attach card flip click handlers
    const reasonCards = reasonsGrid.querySelectorAll('.reason-card');
    reasonCards.forEach(card => {
      const toggleFlip = () => {
        const isFlipped = card.classList.contains('flipped');
        if (!isFlipped) {
          card.classList.add('flipped');
          card.setAttribute('aria-expanded', 'true');
          revealedReasonsCount++;
          updateRevealedBadge();

          // Particle burst at card center
          const rect = card.getBoundingClientRect();
          if (window.particleEngine && typeof window.particleEngine.burstAt === 'function') {
            window.particleEngine.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
          }
        } else {
          card.classList.remove('flipped');
          card.setAttribute('aria-expanded', 'false');
          revealedReasonsCount = Math.max(0, revealedReasonsCount - 1);
          updateRevealedBadge();
        }
      };

      card.addEventListener('click', toggleFlip);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip();
        }
      });
    });

    if (revealAllBtn) {
      revealAllBtn.addEventListener('click', () => {
        reasonCards.forEach((card, index) => {
          setTimeout(() => {
            if (!card.classList.contains('flipped')) {
              card.classList.add('flipped');
              card.setAttribute('aria-expanded', 'true');
              revealedReasonsCount++;
              updateRevealedBadge();
              const rect = card.getBoundingClientRect();
              if (window.particleEngine && typeof window.particleEngine.burstAt === 'function') {
                window.particleEngine.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
              }
            }
          }, index * 140);
        });
      });
    }
  }

  function updateRevealedBadge() {
    if (!revealedBadge) return;
    const total = config.reasons.length;
    revealedBadge.textContent = `${revealedReasonsCount} of ${total} revealed 💕`;
    if (revealedReasonsCount === total) {
      revealedBadge.classList.add('all-revealed');
      revealedBadge.textContent = `All ${total} revealed! You are so special 💖`;
      if (reasonsFinalMessage) {
        reasonsFinalMessage.classList.add('highlighted');
        if (window.particleEngine && typeof window.particleEngine.burstAt === 'function') {
          const rect = reasonsFinalMessage.getBoundingClientRect();
          window.particleEngine.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
        }
      }
    } else {
      revealedBadge.classList.remove('all-revealed');
      if (reasonsFinalMessage) {
        reasonsFinalMessage.classList.remove('highlighted');
      }
    }
  }

  // ----------------------------------------------------
  // PAGE 4: POLAROID PHOTO GALLERY & LIGHTBOX (gallery.html)
  // ----------------------------------------------------
  const galleryGrid = document.getElementById('galleryGrid');
  const lightboxDialog = document.getElementById('lightboxDialog');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxDate = document.getElementById('lightboxDate');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const startSlideshowBtn = document.getElementById('startSlideshowBtn');
  const lightboxPlayPauseBtn = document.getElementById('lightboxPlayPauseBtn');
  const lightboxPlayIcon = document.getElementById('lightboxPlayIcon');
  const lightboxPlayLabel = document.getElementById('lightboxPlayLabel');
  const SLIDESHOW_INTERVAL_MS = 2000;

  // Supported photo extensions (lowercase & uppercase for full server compatibility)
  const SUPPORTED_EXTENSIONS = ['webp', 'jpeg', 'jpg', 'png', 'WEBP', 'JPEG', 'JPG', 'PNG'];

  /**
   * Generates candidate image URLs to try in order (.webp, .jpeg, .jpg, .png)
   * Supporting both "photoX.ext" and "X.ext" naming styles.
   */
  function getImageCandidates(mem) {
    if (!mem) return [];
    const candidates = [];
    const add = (url) => {
      if (url && !candidates.includes(url)) {
        candidates.push(url);
      }
    };

    // 1. If an activeSrc already succeeded, prioritize it
    if (mem.activeSrc) {
      add(mem.activeSrc);
    }

    // 2. Try the configured path and its extension variants
    if (mem.image) {
      add(mem.image);
      const lastSlash = mem.image.lastIndexOf('/');
      const dir = lastSlash !== -1 ? mem.image.substring(0, lastSlash + 1) : '';
      const filename = lastSlash !== -1 ? mem.image.substring(lastSlash + 1) : mem.image;
      const baseName = filename.replace(/\.[^/.]+$/, '');

      SUPPORTED_EXTENSIONS.forEach(ext => {
        add(`${dir}${baseName}.${ext}`);
      });
    }

    // 3. Try standard gallery conventions in BOTH root and subfolders
    const id = mem.id;
    if (id) {
      SUPPORTED_EXTENSIONS.forEach(ext => {
        // Direct root (matches flat GitHub Pages deployment)
        add(`photo${id}.${ext}`);
        add(`${id}.${ext}`);
        // Subfolders (matches nested deployment)
        add(`assets/images/gallery/photo${id}.${ext}`);
        add(`assets/images/gallery/${id}.${ext}`);
        add(`assets/images/photo${id}.${ext}`);
        add(`assets/images/${id}.${ext}`);
      });
    }

    return candidates;
  }

  // Global image error handler: tries candidate extensions before falling back to SVG illustration
  window.handleGalleryImageError = function(imgEl, memId, fallbackSrc) {
    const mem = config.memories.find(m => m.id === memId);
    if (!mem) {
      imgEl.onerror = null;
      imgEl.src = fallbackSrc;
      return;
    }

    if (!imgEl._candidates) {
      imgEl._candidates = getImageCandidates(mem);
      imgEl._candidateIndex = 0;
    }

    imgEl._candidateIndex++;
    if (imgEl._candidates && imgEl._candidateIndex < imgEl._candidates.length) {
      imgEl.src = imgEl._candidates[imgEl._candidateIndex];
    } else {
      // Try subfolder fallback if root fallback fails
      imgEl.onerror = function() {
        imgEl.onerror = null;
        if (fallbackSrc.indexOf('assets') === -1) {
          imgEl.src = `assets/images/${fallbackSrc}`;
        }
      };
      imgEl.src = fallbackSrc;
      mem.activeSrc = fallbackSrc;
    }
  };

  // Global image load handler: records active working source for lightbox & slideshow
  window.handleGalleryImageLoad = function(imgEl, memId) {
    const mem = config.memories.find(m => m.id === memId);
    if (mem) {
      mem.activeSrc = imgEl.currentSrc || imgEl.src;
    }
  };

  if (galleryGrid && config.memories) {
    galleryGrid.innerHTML = config.memories.map((mem, index) => {
      const fallbackSrc = mem.fallback || `memory${index + 1}.svg`;
      const initialSrc = mem.activeSrc || mem.image;
      const isPriority = index < 6;

      return `
      <div class="polaroid-card" style="--rotation: ${mem.rotate || '0deg'}" data-index="${index}" tabindex="0" role="button" aria-label="View photo ${index + 1}">
        <div class="polaroid-tape"></div>
        <div class="polaroid-img-wrapper">
          <img src="${initialSrc}"
               alt="${mem.caption || ''}"
               decoding="async"
               loading="${isPriority ? 'eager' : 'lazy'}"
               ${isPriority ? 'fetchpriority="high"' : ''}
               class="polaroid-img"
               data-mem-id="${mem.id}"
               onload="window.handleGalleryImageLoad(this, ${mem.id})"
               onerror="window.handleGalleryImageError(this, ${mem.id}, '${fallbackSrc}')" />
          <div class="polaroid-zoom-hint">🔍 Tap to enlarge</div>
        </div>
        <div class="polaroid-caption heart-caption-wrapper heart-theme-${mem.id}">
          <div class="heart-shaped-badge ${mem.heartAnim || 'heart-anim-pulse'}">
            <svg class="heart-svg-bg" viewBox="0 0 220 140" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="heartGrad-${mem.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--heart-c1)" />
                  <stop offset="100%" stop-color="var(--heart-c2)" />
                </linearGradient>
              </defs>
              <path class="heart-path-outer" d="M 110,130 C 40,98 6,65 18,34 C 32,6 80,6 110,34 C 140,6 188,6 202,34 C 214,65 180,98 110,130 Z" fill="url(#heartGrad-${mem.id})" />
              <path class="heart-path-inner ${mem.heartBorderStyle || 'border-dashed'}" d="M 110,123 C 46,94 15,64 26,37 C 38,13 82,13 110,38 C 138,13 182,13 194,37 C 205,64 174,94 110,123 Z" fill="none" />
            </svg>
            <div class="heart-badge-content">
              <span class="heart-badge-icon" aria-hidden="true">${mem.heartIcon || '💖'}</span>
              <p class="heart-caption-text">${mem.caption || mem.date}</p>
              <span class="heart-caption-date">${mem.date}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join('');

    const polaroids = galleryGrid.querySelectorAll('.polaroid-card');
    polaroids.forEach(card => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      card.addEventListener('click', () => openLightbox(idx));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });
  }

  function openLightbox(index) {
    if (!lightboxDialog || !config.memories || !config.memories[index]) return;
    currentLightboxIndex = index;
    renderLightboxItem(currentLightboxIndex);

    if (typeof lightboxDialog.showModal === 'function') {
      lightboxDialog.showModal();
    } else {
      lightboxDialog.setAttribute('open', 'true');
    }
  }

  function closeLightbox() {
    if (!lightboxDialog) return;
    stopSlideshow();
    if (typeof lightboxDialog.close === 'function') {
      lightboxDialog.close();
    } else {
      lightboxDialog.removeAttribute('open');
    }
  }

  function renderLightboxItem(index) {
    const mem = config.memories[index];
    if (!mem) return;

    if (lightboxImg) {
      lightboxImg.classList.add('switching');
      const fallbackSrc = mem.fallback || `memory${index + 1}.svg`;
      const activeSrc = mem.activeSrc || mem.image;

      lightboxImg.decoding = 'async';
      lightboxImg._candidates = getImageCandidates(mem);
      lightboxImg._candidateIndex = 0;

      lightboxImg.onload = function() {
        mem.activeSrc = lightboxImg.currentSrc || lightboxImg.src;
        lightboxImg.classList.remove('switching');
      };

      lightboxImg.onerror = function() {
        lightboxImg._candidateIndex++;
        if (lightboxImg._candidates && lightboxImg._candidateIndex < lightboxImg._candidates.length) {
          lightboxImg.src = lightboxImg._candidates[lightboxImg._candidateIndex];
        } else {
          lightboxImg.onerror = function() {
            lightboxImg.onerror = null;
            if (fallbackSrc.indexOf('assets') === -1) {
              lightboxImg.src = `assets/images/${fallbackSrc}`;
            }
            lightboxImg.classList.remove('switching');
          };
          lightboxImg.src = fallbackSrc;
          lightboxImg.classList.remove('switching');
        }
      };

      lightboxImg.src = activeSrc;
      lightboxImg.alt = mem.caption || 'Memory full view';

      // Fast fallback to remove switching class if image is already cached
      setTimeout(() => {
        if (lightboxImg) lightboxImg.classList.remove('switching');
      }, 200);
    }
    if (lightboxCaption) lightboxCaption.textContent = mem.caption || '';
    if (lightboxDate) lightboxDate.textContent = mem.date;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${index + 1} / ${config.memories.length}`;
    }
  }

  function nextLightbox() {
    currentLightboxIndex = (currentLightboxIndex + 1) % config.memories.length;
    renderLightboxItem(currentLightboxIndex);
  }

  function prevLightbox() {
    currentLightboxIndex = (currentLightboxIndex - 1 + config.memories.length) % config.memories.length;
    renderLightboxItem(currentLightboxIndex);
  }

  // Resets the 2-second slideshow timer when user manually interacts
  function resetSlideshowTimer() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
    if (isSlideshowActive) {
      slideshowTimer = setInterval(() => {
        nextLightbox();
      }, SLIDESHOW_INTERVAL_MS);
    }
  }

  function handleUserNext() {
    nextLightbox();
    if (isSlideshowActive) {
      resetSlideshowTimer();
    }
  }

  function handleUserPrev() {
    prevLightbox();
    if (isSlideshowActive) {
      resetSlideshowTimer();
    }
  }

  function updateSlideshowButtons(isPlaying) {
    if (startSlideshowBtn) {
      startSlideshowBtn.classList.toggle('playing', isPlaying);
      startSlideshowBtn.innerHTML = isPlaying ? '<span>⏸ Pause Slideshow</span>' : '<span>▶ Slideshow Mode</span>';
    }
    if (lightboxPlayPauseBtn) {
      lightboxPlayPauseBtn.classList.toggle('playing', isPlaying);
      if (lightboxPlayIcon) lightboxPlayIcon.textContent = isPlaying ? '⏸' : '▶';
      if (lightboxPlayLabel) lightboxPlayLabel.textContent = isPlaying ? 'Pause' : 'Play';
    }
  }

  // Slideshow feature (2000ms auto-advance)
  function startSlideshow(startIndex) {
    // Unconditionally clear any existing interval to prevent duplicate timers
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
    isSlideshowActive = true;

    if (typeof startIndex === 'number') {
      currentLightboxIndex = startIndex;
    }

    if (lightboxDialog && !lightboxDialog.open && !lightboxDialog.hasAttribute('open')) {
      openLightbox(currentLightboxIndex);
    }

    updateSlideshowButtons(true);

    slideshowTimer = setInterval(() => {
      nextLightbox();
    }, SLIDESHOW_INTERVAL_MS);
  }

  function stopSlideshow() {
    isSlideshowActive = false;
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
    updateSlideshowButtons(false);
  }

  function toggleSlideshow() {
    if (isSlideshowActive) {
      stopSlideshow();
    } else {
      startSlideshow(currentLightboxIndex);
    }
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', handleUserNext);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', handleUserPrev);
  if (startSlideshowBtn) startSlideshowBtn.addEventListener('click', toggleSlideshow);
  if (lightboxPlayPauseBtn) lightboxPlayPauseBtn.addEventListener('click', toggleSlideshow);

  // Close lightbox when clicking the backdrop, keyboard navigation & play/pause
  if (lightboxDialog) {
    lightboxDialog.addEventListener('click', (e) => {
      const dialogDimensions = lightboxDialog.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        closeLightbox();
      }
    });

    lightboxDialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        handleUserNext();
      } else if (e.key === 'ArrowLeft') {
        handleUserPrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleSlideshow();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  // ----------------------------------------------------
  // PAGE 5: THE FINAL BIRTHDAY SURPRISE (final.html)
  // ----------------------------------------------------
  const birthdayCake = document.getElementById('birthdayCake');
  const candleBlowBtn = document.getElementById('candleBlowBtn');
  const candlePromptText = document.getElementById('candlePromptText');
  const surpriseHeading = document.getElementById('surpriseHeading');
  const wishCardTitle = document.getElementById('wishCardTitle');
  const wishCardText = document.getElementById('wishCardText');
  const finalQuote = document.getElementById('finalQuote');
  const finalSignature = document.getElementById('finalSignature');
  const restartBtn = document.getElementById('restartBtn');
  const sendHugBtn = document.getElementById('sendHugBtn');

  // If on final.html, automatically spawn floating balloons on page load!
  if (birthdayCake || isFinalPage) {
    window.particleEngine.spawnBalloons();
  }

  // Fill config text
  if (surpriseHeading) surpriseHeading.textContent = config.finalSurprise.heading;
  if (candlePromptText) candlePromptText.textContent = config.finalSurprise.candleBlowText;
  if (wishCardTitle) wishCardTitle.textContent = config.finalSurprise.wishCardTitle;
  if (wishCardText) wishCardText.textContent = config.finalSurprise.wishCardText;
  if (finalQuote) finalQuote.textContent = config.finalSurprise.finalQuote;
  if (finalSignature) finalSignature.textContent = config.finalSurprise.signature;

  function blowCandles() {
    if (areCandlesBlown) return;
    areCandlesBlown = true;

    // Extinguish candle flames
    const candleFlames = document.querySelectorAll('.candle-flame');
    candleFlames.forEach(flame => {
      flame.classList.add('extinguished');
    });

    // Sound effect
    window.birthdayAudio.playCandleBlow();

    // Massive celebratory confetti blast & floating balloons!
    window.particleEngine.triggerConfettiBlast();
    window.particleEngine.spawnBalloons();

    // Update text
    if (candlePromptText) {
      candlePromptText.textContent = config.finalSurprise.candlesBlownMessage;
      candlePromptText.classList.add('wish-granted');
    }

    if (candleBlowBtn) {
      candleBlowBtn.disabled = true;
      candleBlowBtn.innerHTML = '<span>✨ Wish Granted! 🌟</span>';
      candleBlowBtn.classList.add('blown');
    }

    // Sparkle burst around the cake
    if (birthdayCake) {
      const rect = birthdayCake.getBoundingClientRect();
      window.particleEngine.burstAt(rect.left + rect.width / 2, rect.top + 40, 25);
    }
  }

  if (candleBlowBtn) {
    candleBlowBtn.addEventListener('click', blowCandles);
  }
  if (birthdayCake) {
    birthdayCake.addEventListener('click', blowCandles);
  }

  // Send Birthday Hug Button
  if (sendHugBtn) {
    sendHugBtn.addEventListener('click', () => {
      window.particleEngine.triggerConfettiBlast();
      window.birthdayAudio.playUnlockSuccess();
      showToast("Sent a warm virtual hug to Sanuu! 🤗💖");
    });
  }

  // Toast notification helper
  function showToast(message) {
    let toast = document.getElementById('birthdayToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'birthdayToast';
      toast.className = 'birthday-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }
});
