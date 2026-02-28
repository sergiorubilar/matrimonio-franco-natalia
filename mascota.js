/* ========================================
   MASCOTA — Yorkshire SVG interactivo
   Marco circular elegante, auto-habla,
   se mueve entre secciones, duerme,
   reacciona al scroll, easter egg
   ======================================== */

(function () {
  'use strict';

  // ============================
  // FRASES DE BODA
  // ============================
  var phrases = [
    // Emotivas — desde el perrito
    '¡Mis papás se casan! 💍',
    '¡Soy el perrito más feliz del mundo! 🐾',
    '¡Mi familia se agranda! 🥹',
    '¡Les presento a mis papás! 👫',
    '¡Estoy tan orgulloso de ellos! 😍',
    '¡El amor de mis papás es hermoso! 💕',
    '¡Ya quiero llevar los anillos! 💎',
    '¡Prometí no llorar... pero no prometo nada! 🥺',
    // Celebración
    '¡Vivan los novios! 🥂',
    '¡El amor está en el aire! 💗',
    '¡Será la mejor boda del año! 🎉',
    '¡A celebrar este gran amor! ✨',
    '¡Los novios están felices! 😊',
    '¡Natalia y Franco, por siempre! 💞',
    // Invitación
    '¡No te lo puedes perder! 🙏',
    '¡Confirma tu asistencia! 📩',
    '¡Ven a brindar con nosotros! 🥂',
    '¡1 de mayo, anótalo! 📅',
    '¡Te esperamos con todo el cariño! 🤗',
    // Fiesta y emoción
    '¡No puedo esperar por la fiesta! 🎊',
    '¡Habrá música y baile! 🎶',
    '¡Qué emoción, ya falta poco! 😆',
    '¡El gran día se acerca! ⏳',
    '¡Prepara tus mejores pasos de baile! 💃',
    '¡Yo ya tengo mi traje listo! 🤵',
    '¡Esta boda va a ser inolvidable! 🌟'
  ];

  var sectionPhrases = {
    hero: '¡Natalia y Franco, por siempre! 💞',
    countdown: '¡Ya falta muy poco! ⏳',
    message: '¡Qué emoción, se viene la boda! 🥹',
    fecha: '¡1 de mayo, anótalo! 📅',
    fiesta: '¡Habrá música y baile! 🎶'
  };

  var lastPhraseIndex = -1;
  function getRandomPhrase() {
    var idx;
    do { idx = Math.floor(Math.random() * phrases.length); }
    while (idx === lastPhraseIndex && phrases.length > 1);
    lastPhraseIndex = idx;
    return phrases[idx];
  }

  // ============================
  // REFERENCIAS
  // ============================
  var container = null;
  var bubbleTimer = null;
  var isBubbleVisible = false;
  var bubbleShownAt = 0;
  var MIN_BUBBLE_TIME = 2500; // minimum ms a bubble stays visible
  var autoTalkTimer = null;
  var currentSide = 'right';
  var isMoving = false;
  var tapCount = 0;
  var rapidTapCount = 0;
  var rapidTapTimer = null;
  var isSleeping = false;
  var sleepTimer = null;
  var SLEEP_DELAY = 30000; // 30 seconds

  // ============================
  // CREAR DOM
  // ============================
  function createMascotDOM() {
    var el = document.createElement('div');
    el.className = 'mascota';
    el.id = 'mascota';

    el.innerHTML =
      '<div class="mascota__bubble" id="mascota-bubble">' +
        '<span class="mascota__bubble-text" id="mascota-bubble-text"></span>' +
      '</div>' +
      '<div class="mascota__hearts" id="mascota-hearts"></div>' +
      '<div class="mascota__zzz" id="mascota-zzz">Z</div>' +
      '<div class="mascota__circle">' +
        '<img class="mascota__img" src="assets/yorkshire.svg" alt="Yorkito" draggable="false">' +
      '</div>';

    document.body.appendChild(el);
    return el;
  }

  // ============================
  // BURBUJA DE TEXTO + GLOW
  // ============================
  function showBubble(text) {
    var bubble = document.getElementById('mascota-bubble');
    var bubbleText = document.getElementById('mascota-bubble-text');
    if (!bubble || !bubbleText || !container) return;

    clearTimeout(bubbleTimer);
    bubbleText.textContent = text;

    // Reset classes for fresh entrance
    bubble.classList.remove('is-visible', 'is-fading');
    void bubble.offsetWidth;
    bubble.classList.add('is-visible');
    isBubbleVisible = true;
    bubbleShownAt = Date.now();

    // Golden glow pulse
    container.classList.remove('mascota--speaking');
    void container.offsetWidth;
    container.classList.add('mascota--speaking');

    // After 3s, start fade-out (0.6s transition), then fully hide
    bubbleTimer = setTimeout(function () {
      bubble.classList.remove('is-visible');
      bubble.classList.add('is-fading');
      container.classList.remove('mascota--speaking');
      setTimeout(function () {
        bubble.classList.remove('is-fading');
        isBubbleVisible = false;
        processPendingMove();
      }, 600);
    }, 3000);

    // Reset sleep timer on any activity
    resetSleepTimer();
  }

  function hideBubble(force) {
    if (!force && isBubbleVisible) {
      var elapsed = Date.now() - bubbleShownAt;
      if (elapsed < MIN_BUBBLE_TIME) {
        return; // Let the bubble finish naturally
      }
    }
    var bubble = document.getElementById('mascota-bubble');
    if (!bubble) return;

    clearTimeout(bubbleTimer);
    if (container) container.classList.remove('mascota--speaking');

    if (isBubbleVisible) {
      // Fade out gracefully
      bubble.classList.remove('is-visible');
      bubble.classList.add('is-fading');
      isBubbleVisible = false;
      setTimeout(function () {
        bubble.classList.remove('is-fading');
      }, 600);
    } else {
      bubble.classList.remove('is-visible', 'is-fading');
      isBubbleVisible = false;
    }
  }

  // ============================
  // CORAZONES BURST
  // ============================
  function heartBurst(count) {
    var heartsContainer = document.getElementById('mascota-hearts');
    if (!heartsContainer) return;

    var n = count || 6;
    var hearts = ['❤️', '💛', '🧡', '💕', '💖', '✨'];
    for (var i = 0; i < n; i++) {
      var heart = document.createElement('span');
      heart.className = 'mascota__heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.setProperty('--x', (Math.random() * 100 - 50) + 'px');
      heart.style.setProperty('--delay', (Math.random() * 0.2) + 's');
      heartsContainer.appendChild(heart);

      (function (el) {
        setTimeout(function () { el.remove(); }, 1400);
      })(heart);
    }
  }

  // ============================
  // CONFETTI DORADO
  // ============================
  function goldenConfetti(count) {
    var heartsContainer = document.getElementById('mascota-hearts');
    if (!heartsContainer) return;

    var n = count || 10;
    for (var i = 0; i < n; i++) {
      var conf = document.createElement('span');
      conf.className = 'mascota__confetti';
      conf.style.setProperty('--x', (Math.random() * 120 - 60) + 'px');
      conf.style.setProperty('--r', (Math.random() * 360) + 'deg');
      conf.style.setProperty('--delay', (Math.random() * 0.25) + 's');
      heartsContainer.appendChild(conf);

      (function (el) {
        setTimeout(function () { el.remove(); }, 1200);
      })(conf);
    }
  }

  // ============================
  // MODO DORMILÓN
  // ============================
  function fallAsleep() {
    if (isSleeping || !container) return;
    isSleeping = true;
    hideBubble();
    container.classList.add('mascota--sleeping');
  }

  function wakeUp(withBounce) {
    if (!isSleeping || !container) return;
    isSleeping = false;
    container.classList.remove('mascota--sleeping');

    if (withBounce && typeof gsap !== 'undefined') {
      gsap.fromTo(container.querySelector('.mascota__circle'),
        { scale: 0.85 },
        { scale: 1, duration: 0.5, ease: 'back.out(2)' }
      );
    }

    // Say something after waking
    setTimeout(function () {
      showBubble('¡Estoy despierto! ¿Qué me perdí? 😴');
    }, 400);

    resetSleepTimer();
  }

  function resetSleepTimer() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(fallAsleep, SLEEP_DELAY);
  }

  // ============================
  // REACCIÓN AL SCROLL
  // ============================
  var scrollShakeTimeout = null;
  var lastScrollY = 0;
  var scrollSpeed = 0;

  function setupScrollReaction() {
    if (!container) return;

    window.addEventListener('scroll', function () {
      var currentY = window.scrollY;
      scrollSpeed = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Wake up on scroll
      if (isSleeping) {
        wakeUp(true);
        return;
      }

      resetSleepTimer();

      // Shake on fast scroll
      if (scrollSpeed > 60 && !scrollShakeTimeout) {
        container.classList.remove('mascota--shaking');
        void container.offsetWidth;
        container.classList.add('mascota--shaking');

        scrollShakeTimeout = setTimeout(function () {
          container.classList.remove('mascota--shaking');
          scrollShakeTimeout = null;
        }, 450);
      }
    }, { passive: true });
  }

  // ============================
  // EASTER EGG — 10 TAPS
  // ============================
  function triggerEasterEgg() {
    if (!container) return;

    // Spin animation
    container.classList.remove('mascota--spin');
    void container.offsetWidth;
    container.classList.add('mascota--spin');

    // Mega burst
    heartBurst(15);
    goldenConfetti(20);

    // Special message
    setTimeout(function () {
      showBubble('¡Natalia y Franco se casan! 💍');
    }, 300);

    // Second wave
    setTimeout(function () {
      heartBurst(10);
      goldenConfetti(15);
    }, 500);

    setTimeout(function () {
      container.classList.remove('mascota--spin');
    }, 850);
  }

  // ============================
  // INTERACCIÓN TAP
  // ============================
  function onTap() {
    if (!container) return;

    // Wake up if sleeping
    if (isSleeping) {
      wakeUp(true);
      return;
    }

    tapCount++;

    // Track rapid taps for easter egg
    rapidTapCount++;
    clearTimeout(rapidTapTimer);
    rapidTapTimer = setTimeout(function () { rapidTapCount = 0; }, 2000);

    // Easter egg: 10 rapid taps
    if (rapidTapCount >= 10) {
      rapidTapCount = 0;
      triggerEasterEgg();
      return;
    }

    // Jump animation
    container.classList.remove('mascota--jump');
    void container.offsetWidth;
    container.classList.add('mascota--jump');

    // Show phrase
    showBubble(getRandomPhrase());

    // Every 3 taps: hearts
    if (tapCount % 3 === 0) {
      heartBurst();
    }

    // Every 5 taps: golden confetti
    if (tapCount % 5 === 0) {
      goldenConfetti();
    }

    setTimeout(function () {
      container.classList.remove('mascota--jump');
    }, 500);

    resetSleepTimer();
  }

  // ============================
  // AUTO-HABLA PERIÓDICA
  // ============================
  function startAutoTalk() {
    function scheduleNext() {
      var delay = 8000 + Math.random() * 5000;
      autoTalkTimer = setTimeout(function () {
        if (!isBubbleVisible) {
          // If sleeping, wake up first then speak
          if (isSleeping) {
            wakeUp(true);
          } else {
            showBubble(getRandomPhrase());
          }
        }
        scheduleNext();
      }, delay);
    }
    scheduleNext();
  }

  function stopAutoTalk() {
    clearTimeout(autoTalkTimer);
  }

  // ============================
  // MOVIMIENTO ENTRE SECCIONES
  // ============================
  var sectionMap = [
    { selector: '.hero', side: 'right', key: 'hero' },
    { selector: '.countdown', side: 'left', key: 'countdown' },
    { selector: '.message', side: 'right', key: 'message' },
    { selector: '.fecha', side: 'left', key: 'fecha' },
    { selector: '.fiesta', side: 'right', key: 'fiesta' }
  ];

  function setupSectionMovement() {
    if (typeof gsap === 'undefined' || !container) return;

    var currentSection = null;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var sectionInfo = null;
        for (var i = 0; i < sectionMap.length; i++) {
          if (entry.target.matches(sectionMap[i].selector)) {
            sectionInfo = sectionMap[i];
            break;
          }
        }
        if (!sectionInfo || sectionInfo.key === currentSection) return;

        currentSection = sectionInfo.key;
        moveToSide(sectionInfo.side, sectionInfo.key);
      });
    }, { threshold: 0.3 });

    sectionMap.forEach(function (s) {
      var el = document.querySelector(s.selector);
      if (el) observer.observe(el);
    });
  }

  var pendingMove = null;

  function moveToSide(side, sectionKey) {
    if (side === currentSide || !container) return;

    // If bubble is visible, queue the move for after it finishes
    if (isBubbleVisible || isMoving) {
      pendingMove = { side: side, key: sectionKey };
      return;
    }

    isMoving = true;

    var tl = gsap.timeline({
      onComplete: function () {
        currentSide = side;
        isMoving = false;

        setTimeout(function () {
          if (sectionPhrases[sectionKey] && !isBubbleVisible && !isSleeping) {
            showBubble(sectionPhrases[sectionKey]);
          }
        }, 800);
      }
    });

    tl.to(container, {
      scale: 0.7,
      opacity: 0.6,
      duration: 0.3,
      ease: 'power2.in'
    })
    .call(function () {
      if (side === 'left') {
        container.style.right = 'auto';
        container.style.left = '16px';
        container.classList.add('mascota--left');
      } else {
        container.style.left = 'auto';
        container.style.right = '16px';
        container.classList.remove('mascota--left');
      }
    })
    .to(container, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(1.6)'
    });
  }

  function processPendingMove() {
    if (pendingMove && !isBubbleVisible && !isMoving) {
      var move = pendingMove;
      pendingMove = null;
      moveToSide(move.side, move.key);
    }
  }

  // ============================
  // OCULTAR EN MODALES
  // ============================
  function setupModalHiding() {
    if (!container) return;

    var modals = document.querySelectorAll('.fullscreen');
    modals.forEach(function (modal) {
      new MutationObserver(function () {
        var isOpen = modal.getAttribute('aria-hidden') === 'false';
        container.style.opacity = isOpen ? '0' : '1';
        container.style.pointerEvents = isOpen ? 'none' : 'auto';
        if (isOpen) { stopAutoTalk(); hideBubble(); }
        else { startAutoTalk(); }
      }).observe(modal, { attributes: true, attributeFilter: ['aria-hidden'] });
    });

    var success = document.getElementById('success-screen');
    if (success) {
      new MutationObserver(function () {
        var isOpen = success.getAttribute('aria-hidden') === 'false';
        container.style.opacity = isOpen ? '0' : '1';
        container.style.pointerEvents = isOpen ? 'none' : 'auto';
        if (isOpen) { stopAutoTalk(); hideBubble(); }
        else { startAutoTalk(); }
      }).observe(success, { attributes: true, attributeFilter: ['aria-hidden'] });
    }
  }

  // ============================
  // BUTTON INTERACTIONS
  // ============================
  function setupButtonInteractions() {
    var btnConfirmar = document.getElementById('btn-confirmar');
    if (btnConfirmar) {
      btnConfirmar.addEventListener('click', function () {
        showBubble('¡Genial, confirma! 📩');
        heartBurst();
      });
    }

    var btnPlaylist = document.getElementById('btn-playlist');
    if (btnPlaylist) {
      btnPlaylist.addEventListener('click', function () {
        showBubble('¡A bailar en la fiesta! 💃');
      });
    }
  }

  // ============================
  // INIT
  // ============================
  function init() {
    container = createMascotDOM();

    // Entrance
    if (typeof gsap !== 'undefined') {
      gsap.set(container, { y: 60, opacity: 0, scale: 0.5 });
      gsap.to(container, {
        y: 0, opacity: 1, scale: 1,
        duration: 0.8,
        ease: 'back.out(1.8)',
        delay: 0.3
      });
    } else {
      container.style.opacity = '1';
    }

    // Tap
    container.addEventListener('click', function (e) {
      e.stopPropagation();
      onTap();
    });

    // First greeting
    setTimeout(function () {
      showBubble('¡Bienvenidos a la boda! 🐾');
    }, 1800);

    // Start systems
    setTimeout(startAutoTalk, 6000);
    resetSleepTimer();

    setupScrollReaction();
    setupSectionMovement();
    setupModalHiding();
    setupButtonInteractions();
  }

  // ============================
  // WAIT FOR INTRO TO CLOSE
  // ============================
  var introEl = document.getElementById('intro');
  if (introEl) {
    var obs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.removedNodes.forEach(function (node) {
          if (node === introEl || node.id === 'intro') {
            obs.disconnect();
            setTimeout(init, 600);
          }
        });
      });
    });
    obs.observe(introEl.parentNode, { childList: true });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
