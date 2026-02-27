/* ========================================
   MASCOTA VIRTUAL — Yorkshire Terrier
   Scroll companion using traced SVG image
   with container-based GSAP animations
   ======================================== */

(function () {
  'use strict';

  var mascotReady = false;
  var mascotEl = null;
  var currentAnchor = null;

  /* =============================================
     Section anchors
     ============================================= */
  var sections = [
    { selector: '.hero',      side: 'right', phrase: '¡Bienvenido!' },
    { selector: '.countdown', side: 'right', phrase: '¡Ya falta poco!' },
    { selector: '.message',   side: 'left',  phrase: '¡Qué emoción!' },
    { selector: '.fecha',     side: 'right', phrase: '¡No faltes!' },
    { selector: '.fiesta',    side: 'left',  phrase: '¡A bailar!' }
  ];

  /* =============================================
     Wait for intro
     ============================================= */
  function waitForIntro() {
    var intro = document.getElementById('intro');
    if (!intro) { initMascot(); return; }
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
    createDOM();
    startScrollTracking();
    bindTap();
  }

  /* =============================================
     Create DOM
     ============================================= */
  function createDOM() {
    var el = document.createElement('div');
    el.className = 'mascota';
    el.id = 'mascota';
    el.innerHTML =
      '<div class="mascota__inner">' +
        '<div class="mascota__bubble" id="mascota-bubble">' +
          '<span class="mascota__bubble-text" id="mascota-bubble-text"></span>' +
        '</div>' +
        '<div class="mascota__hearts" id="mascota-hearts"></div>' +
        '<img class="mascota__img" src="assets/yorkshire.svg" alt="Yorkito" draggable="false"/>' +
      '</div>';
    document.body.appendChild(el);
    mascotEl = el;
    if (typeof gsap !== 'undefined') gsap.set(el, { opacity: 0, y: 40 });
  }

  /* =============================================
     SPIN
     ============================================= */
  function doSpin(onDone) {
    if (typeof gsap === 'undefined') return;
    gsap.to('.mascota__inner', {
      rotation: '+=360',
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: function () {
        gsap.set('.mascota__inner', { rotation: 0 });
        if (onDone) onDone();
      }
    });
  }

  /* =============================================
     HOP — used when moving between sections
     ============================================= */
  function doHop() {
    if (typeof gsap === 'undefined' || !mascotEl) return;
    var inner = mascotEl.querySelector('.mascota__inner');
    if (!inner) return;
    gsap.timeline()
      .to(inner, { scaleY: 0.88, scaleX: 1.1, duration: 0.08, ease: 'power2.in', transformOrigin: '50% 100%' })
      .to(inner, { y: -12, scaleY: 1.06, scaleX: 0.95, duration: 0.15, ease: 'power2.out', transformOrigin: '50% 100%' })
      .to(inner, { y: 0, scaleY: 0.92, scaleX: 1.06, duration: 0.12, ease: 'power2.in', transformOrigin: '50% 100%' })
      .to(inner, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'elastic.out(1,0.6)', transformOrigin: '50% 100%' });
  }

  /* =============================================
     SCROLL TRACKING
     ============================================= */
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
        if (ratio > bestRatio) { bestRatio = ratio; best = sectionEls[i]; }
      }
      return bestRatio > 0.2 ? best : null;
    }

    function getTargetPos(sd) {
      if (!sd) return null;
      var rect = sd.el.getBoundingClientRect();
      var size = 100;
      var margin = 8;
      var y = rect.bottom - size - margin;
      y = Math.max(margin, Math.min(window.innerHeight - size - margin, y));
      var x;
      if (sd.config.side === 'right') {
        x = Math.min(rect.right - size - margin, window.innerWidth - size - margin);
      } else {
        x = Math.max(rect.left + margin, margin);
      }
      return { x: x, y: y };
    }

    var firstReveal = true;
    var phraseShown = {};

    function updatePosition() {
      if (!mascotEl || typeof gsap === 'undefined') return;
      var vis = getMostVisibleSection();
      if (!vis) return;
      var target = getTargetPos(vis);
      if (!target) return;
      var key = vis.config.selector;

      if (firstReveal) {
        firstReveal = false;
        gsap.set(mascotEl, { left: target.x, top: target.y });
        gsap.to(mascotEl, {
          opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)',
          onComplete: function () {
            if (!phraseShown[key]) { phraseShown[key] = true; showBubble(vis.config.phrase); }
          }
        });
        currentAnchor = key;
        return;
      }

      if (key !== currentAnchor) {
        currentAnchor = key;
        doHop();
        gsap.to(mascotEl, {
          left: target.x,
          top: target.y,
          duration: 0.7,
          ease: 'power2.inOut',
          onComplete: function () {
            if (!phraseShown[key]) {
              phraseShown[key] = true;
              showBubble(vis.config.phrase);
            }
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
        requestAnimationFrame(function () { updatePosition(); ticking = false; });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    setTimeout(updatePosition, 100);
  }

  /* =============================================
     SPEECH BUBBLE
     ============================================= */
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

  /* =============================================
     TAP INTERACTIONS
     ============================================= */
  var tapCount = 0;

  function bindTap() {
    if (!mascotEl) return;
    mascotEl.addEventListener('click', function (e) {
      e.stopPropagation();
      if (typeof gsap === 'undefined') return;
      tapCount++;

      // Every 5th tap → spin!
      if (tapCount % 5 === 0) {
        doSpin();
        showBubble('¡Wiii!');
        return;
      }

      // Jump with squash & stretch
      var inner = mascotEl.querySelector('.mascota__inner');
      if (inner) {
        gsap.timeline()
          .to(inner, { scaleX: 1.15, scaleY: 0.85, duration: 0.1, ease: 'power2.in', transformOrigin: '50% 100%' })
          .to(inner, { y: -22, scaleX: 0.9, scaleY: 1.1, duration: 0.25, ease: 'power2.out', transformOrigin: '50% 100%' })
          .to(inner, { y: 0, scaleX: 1.1, scaleY: 0.9, duration: 0.2, ease: 'power2.in', transformOrigin: '50% 100%' })
          .to(inner, { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'elastic.out(1,0.5)', transformOrigin: '50% 100%' });
      }

      // Speech bubble
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
          .to(heart, { x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, scale: 0.5 + Math.random() * 0.7, opacity: 1, duration: 0.4, ease: 'power2.out', delay: idx * 0.05 })
          .to(heart, { y: Math.sin(rad) * dist - 25, opacity: 0, duration: 0.6, ease: 'power1.in', onComplete: function () { heart.remove(); } });
      })(i);
    }
  }

  /* =============================================
     BOOTSTRAP
     ============================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForIntro);
  } else {
    waitForIntro();
  }

})();
