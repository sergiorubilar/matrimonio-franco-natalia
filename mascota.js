/* ========================================
   MASCOTA VIRTUAL — Yorkshire Terrier
   Single scroll companion that moves between sections
   Uses the real dog illustration (assets/mascota.png)
   ======================================== */

(function () {
  'use strict';

  var mascotReady = false;
  var mascotEl = null;
  var currentAnchor = null;

  // Section positions: where the mascot sits in the viewport
  var sections = [
    { selector: '.hero',      side: 'right', phrase: '¡Bienvenido!' },
    { selector: '.countdown', side: 'right', phrase: '¡Ya falta poco!' },
    { selector: '.message',   side: 'left',  phrase: '¡Qué emoción!' },
    { selector: '.fecha',     side: 'right', phrase: '¡No faltes!' },
    { selector: '.fiesta',    side: 'left',  phrase: '¡A bailar!' }
  ];

  // ============================
  // WAIT FOR INTRO TO FINISH
  // ============================
  function waitForIntro() {
    var intro = document.getElementById('intro');
    if (!intro) {
      initMascot();
      return;
    }
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        for (var j = 0; j < mutations[i].removedNodes.length; j++) {
          if (mutations[i].removedNodes[j] === intro) {
            observer.disconnect();
            setTimeout(initMascot, 1200);
            return;
          }
        }
      }
    });
    observer.observe(intro.parentNode, { childList: true });
  }

  function initMascot() {
    if (mascotReady) return;
    mascotReady = true;
    createMascotDOM();
    startScrollTracking();
    bindTap();
  }

  // ============================
  // CREATE SINGLE MASCOT ELEMENT
  // ============================
  function createMascotDOM() {
    var el = document.createElement('div');
    el.className = 'mascota';
    el.id = 'mascota';
    el.innerHTML =
      '<div class="mascota__inner">' +
        '<div class="mascota__bubble" id="mascota-bubble">' +
          '<span class="mascota__bubble-text" id="mascota-bubble-text"></span>' +
        '</div>' +
        '<div class="mascota__hearts" id="mascota-hearts"></div>' +
        '<img class="mascota__img" src="assets/yorkshire.jpeg" alt="Mascota" draggable="false" />' +
      '</div>';

    document.body.appendChild(el);
    mascotEl = el;

    // Start hidden, entrance happens on first section detection
    if (typeof gsap !== 'undefined') {
      gsap.set(el, { opacity: 0, y: 40 });
    }
  }

  // ============================
  // SCROLL TRACKING — move mascot between sections
  // ============================
  function startScrollTracking() {
    var sectionEls = [];
    sections.forEach(function (s) {
      var el = document.querySelector(s.selector);
      if (el) sectionEls.push({ el: el, config: s });
    });

    function getMostVisibleSection() {
      var best = null;
      var bestRatio = 0;
      var viewH = window.innerHeight;

      for (var i = 0; i < sectionEls.length; i++) {
        var rect = sectionEls[i].el.getBoundingClientRect();
        var top = Math.max(0, rect.top);
        var bottom = Math.min(viewH, rect.bottom);
        var visible = Math.max(0, bottom - top);
        var ratio = visible / Math.min(rect.height, viewH);

        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = sectionEls[i];
        }
      }

      return bestRatio > 0.2 ? best : null;
    }

    function getTargetPosition(sectionData) {
      if (!sectionData) return null;
      var rect = sectionData.el.getBoundingClientRect();
      var mascotSize = 90;
      var margin = 10;

      var y = rect.bottom - mascotSize - margin;
      y = Math.max(margin, Math.min(window.innerHeight - mascotSize - margin, y));

      var x;
      if (sectionData.config.side === 'right') {
        x = Math.min(rect.right - mascotSize - margin, window.innerWidth - mascotSize - margin);
      } else {
        x = Math.max(rect.left + margin, margin);
      }

      return { x: x, y: y, side: sectionData.config.side };
    }

    var isFirstReveal = true;
    var phraseShown = {};

    function updatePosition() {
      if (!mascotEl || typeof gsap === 'undefined') return;

      var visible = getMostVisibleSection();
      if (!visible) return;

      var target = getTargetPosition(visible);
      if (!target) return;

      var key = visible.config.selector;

      // Flip direction based on side
      var img = mascotEl.querySelector('.mascota__img');
      if (img) {
        img.style.transform = target.side === 'left' ? 'scaleX(-1)' : '';
      }

      if (isFirstReveal) {
        isFirstReveal = false;
        gsap.set(mascotEl, { left: target.x, top: target.y });
        gsap.to(mascotEl, {
          opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)',
          onComplete: function () {
            if (!phraseShown[key]) {
              phraseShown[key] = true;
              showBubble(visible.config.phrase);
            }
          }
        });
        currentAnchor = key;
        return;
      }

      if (key !== currentAnchor) {
        currentAnchor = key;

        // Bounce-move to new position
        var inner = mascotEl.querySelector('.mascota__inner');
        gsap.timeline()
          .to(inner, { scaleY: 0.85, scaleX: 1.15, duration: 0.1, transformOrigin: '50% 100%' })
          .to(inner, { scaleY: 1.1, scaleX: 0.9, duration: 0.15, transformOrigin: '50% 100%' })
          .to(mascotEl, {
            left: target.x, top: target.y,
            duration: 0.5, ease: 'power2.inOut'
          }, '<')
          .to(inner, { scaleY: 0.9, scaleX: 1.1, duration: 0.1, transformOrigin: '50% 100%' })
          .to(inner, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'elastic.out(1,0.5)', transformOrigin: '50% 100%' })
          .add(function () {
            if (!phraseShown[key]) {
              phraseShown[key] = true;
              showBubble(visible.config.phrase);
            }
          });
      } else {
        gsap.to(mascotEl, {
          left: target.x, top: target.y,
          duration: 0.4, ease: 'power2.out', overwrite: 'auto'
        });
      }
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          updatePosition();
          ticking = false;
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    setTimeout(updatePosition, 100);
  }

  // ============================
  // SPEECH BUBBLE
  // ============================
  var tapPhrases = [
    '¡Guau!', '¡Woof!', '¡Viva los novios!', '¡Qué fiesta!',
    '¡Te quiero!', '♡', '¡Salud!', '¡Felicidades!', '¡Woof woof!'
  ];

  function showBubble(text) {
    if (typeof gsap === 'undefined' || !mascotEl) return;
    var bubble = document.getElementById('mascota-bubble');
    var textEl = document.getElementById('mascota-bubble-text');
    if (!bubble || !textEl) return;

    textEl.textContent = text;
    gsap.killTweensOf(bubble);
    gsap.timeline()
      .set(bubble, { scale: 0, opacity: 0, display: 'flex' })
      .to(bubble, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
      .to(bubble, {
        scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in', delay: 2,
        onComplete: function () { gsap.set(bubble, { display: 'none' }); }
      });
  }

  // ============================
  // TAP INTERACTIONS
  // ============================
  var tapCount = 0;

  function bindTap() {
    if (!mascotEl) return;

    mascotEl.addEventListener('click', function (e) {
      e.stopPropagation();
      if (typeof gsap === 'undefined') return;
      tapCount++;

      // Jump with squash & stretch
      var inner = mascotEl.querySelector('.mascota__inner');
      if (inner) {
        gsap.timeline()
          .to(inner, { scaleX: 1.15, scaleY: 0.85, duration: 0.1, ease: 'power2.in', transformOrigin: '50% 100%' })
          .to(inner, { y: -25, scaleX: 0.9, scaleY: 1.1, duration: 0.25, ease: 'power2.out', transformOrigin: '50% 100%' })
          .to(inner, { y: 0, scaleX: 1.1, scaleY: 0.9, duration: 0.2, ease: 'power2.in', transformOrigin: '50% 100%' })
          .to(inner, { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'elastic.out(1,0.5)', transformOrigin: '50% 100%' });
      }

      // Bubble
      showBubble(tapPhrases[Math.floor(Math.random() * tapPhrases.length)]);

      // Hearts every 3 taps
      if (tapCount % 3 === 0) doHeartBurst();
    });
  }

  function doHeartBurst() {
    var container = document.getElementById('mascota-hearts');
    if (!container || typeof gsap === 'undefined') return;

    for (var i = 0; i < 6; i++) {
      (function (idx) {
        var heart = document.createElement('span');
        heart.className = 'mascota__heart';
        heart.textContent = '♥';
        container.appendChild(heart);

        var angle = -90 + (idx - 2.5) * 25 + (Math.random() - 0.5) * 20;
        var rad = angle * Math.PI / 180;
        var dist = 35 + Math.random() * 25;

        gsap.set(heart, { x: 0, y: 0, scale: 0, opacity: 1 });
        gsap.timeline()
          .to(heart, {
            x: Math.cos(rad) * dist, y: Math.sin(rad) * dist,
            scale: 0.5 + Math.random() * 0.7, opacity: 1,
            duration: 0.4, ease: 'power2.out', delay: idx * 0.05
          })
          .to(heart, {
            y: Math.sin(rad) * dist - 25, opacity: 0,
            duration: 0.6, ease: 'power1.in',
            onComplete: function () { heart.remove(); }
          });
      })(i);
    }
  }

  // ============================
  // BOOTSTRAP
  // ============================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForIntro);
  } else {
    waitForIntro();
  }

})();
