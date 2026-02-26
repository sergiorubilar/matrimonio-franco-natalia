/* ========================================
   MASCOTA VIRTUAL — Yorkshire Terrier
   Single scroll companion that moves between sections
   ======================================== */

(function () {
  'use strict';

  var mascotReady = false;
  var mascotEl = null;
  var currentAnchor = null;
  var tailTween = null;

  // SVG markup for the yorkie
  var YORKIE_SVG =
    '<svg class="mascota__svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="yorkie-body-group">' +
        '<ellipse cx="100" cy="185" rx="42" ry="8" fill="#D4C4A8" opacity="0.3"/>' +
        '<ellipse cx="72" cy="170" rx="12" ry="16" fill="#C4A46A"/>' +
        '<ellipse cx="128" cy="170" rx="12" ry="16" fill="#C4A46A"/>' +
        '<ellipse cx="70" cy="182" rx="10" ry="6" fill="#8B7355"/>' +
        '<ellipse cx="130" cy="182" rx="10" ry="6" fill="#8B7355"/>' +
        '<ellipse cx="100" cy="150" rx="48" ry="35" fill="#D4B87A"/>' +
        '<ellipse cx="100" cy="148" rx="40" ry="28" fill="#DABE7E" opacity="0.5"/>' +
        '<rect x="78" y="160" width="14" height="24" rx="7" fill="#C4A46A"/>' +
        '<rect x="108" y="160" width="14" height="24" rx="7" fill="#C4A46A"/>' +
        '<ellipse cx="85" cy="183" rx="9" ry="5.5" fill="#8B7355"/>' +
        '<ellipse cx="115" cy="183" rx="9" ry="5.5" fill="#8B7355"/>' +
        '<path d="M88 135 Q100 128 112 135 Q108 145 100 148 Q92 145 88 135Z" fill="#E8D08A" opacity="0.6"/>' +
        '<g class="yorkie-tail" style="transform-origin:10% 90%">' +
          '<path d="M140 138 Q158 115 168 108 Q175 104 172 112 Q165 125 148 140Z" fill="#C4A46A"/>' +
          '<path d="M142 140 Q156 120 164 114 Q168 128 150 142Z" fill="#D4B87A" opacity="0.5"/>' +
        '</g>' +
        '<ellipse cx="100" cy="130" rx="32" ry="6" fill="#BFA880"/>' +
        '<circle cx="100" cy="130" r="5" fill="#A8905E"/>' +
        '<circle cx="100" cy="130" r="3" fill="#D4C4A8"/>' +
      '</g>' +
      '<g class="yorkie-head" style="transform-origin:100px 95px">' +
        '<circle cx="100" cy="90" r="38" fill="#D4B87A"/>' +
        '<ellipse cx="100" cy="95" rx="28" ry="24" fill="#DABE7E"/>' +
        '<path d="M68 78 Q72 50 85 45 Q95 42 100 44 Q105 42 115 45 Q128 50 132 78 Q120 65 100 63 Q80 65 68 78Z" fill="#C4A46A"/>' +
        '<g transform="translate(100,52)">' +
          '<path d="M-8,-4 Q-12,-10 -4,-8 Q0,-12 4,-8 Q12,-10 8,-4 Q12,2 4,0 Q0,4 -4,0 Q-12,2 -8,-4Z" fill="#BFA880"/>' +
          '<circle cx="0" cy="-2" r="2.5" fill="#D4C4A8"/>' +
        '</g>' +
        '<g class="yorkie-ear-left" style="transform-origin:72px 68px">' +
          '<path d="M72 82 Q58 60 66 50 Q72 44 78 52 Q82 65 78 80Z" fill="#C4A46A"/>' +
          '<path d="M72 78 Q62 62 68 54 Q73 50 76 56 Q78 66 76 76Z" fill="#B8964E"/>' +
        '</g>' +
        '<g class="yorkie-ear-right" style="transform-origin:128px 68px">' +
          '<path d="M128 82 Q142 60 134 50 Q128 44 122 52 Q118 65 122 80Z" fill="#C4A46A"/>' +
          '<path d="M128 78 Q138 62 132 54 Q127 50 124 56 Q122 66 124 76Z" fill="#B8964E"/>' +
        '</g>' +
        '<g class="yorkie-eyes">' +
          '<ellipse cx="86" cy="92" rx="7" ry="7.5" fill="#3D2B1A"/>' +
          '<ellipse cx="86" cy="92" rx="5.5" ry="6" fill="#2A1B0D"/>' +
          '<circle cx="84" cy="89.5" r="2.5" fill="#FFFFFF" opacity="0.85"/>' +
          '<circle cx="88.5" cy="93" r="1.2" fill="#FFFFFF" opacity="0.4"/>' +
          '<ellipse cx="114" cy="92" rx="7" ry="7.5" fill="#3D2B1A"/>' +
          '<ellipse cx="114" cy="92" rx="5.5" ry="6" fill="#2A1B0D"/>' +
          '<circle cx="112" cy="89.5" r="2.5" fill="#FFFFFF" opacity="0.85"/>' +
          '<circle cx="116.5" cy="93" r="1.2" fill="#FFFFFF" opacity="0.4"/>' +
          '<ellipse class="yorkie-blink-left" cx="86" cy="92" rx="8" ry="0" fill="#D4B87A"/>' +
          '<ellipse class="yorkie-blink-right" cx="114" cy="92" rx="8" ry="0" fill="#D4B87A"/>' +
        '</g>' +
        '<path d="M96 103 Q100 100 104 103 Q102 107 100 108 Q98 107 96 103Z" fill="#3D2B1A"/>' +
        '<ellipse cx="100" cy="103.5" rx="4.5" ry="3" fill="#2A1B0D"/>' +
        '<ellipse cx="99" cy="102.5" rx="1.5" ry="1" fill="#5A3D24" opacity="0.5"/>' +
        '<path class="yorkie-mouth" d="M96 108 Q100 112 104 108" fill="none" stroke="#8B6842" stroke-width="1.2" stroke-linecap="round"/>' +
        '<ellipse class="yorkie-tongue" cx="100" cy="113" rx="4" ry="5" fill="#E88B8B" opacity="0"/>' +
        '<circle cx="78" cy="100" r="5" fill="#E8C08A" opacity="0.3"/>' +
        '<circle cx="122" cy="100" r="5" fill="#E8C08A" opacity="0.3"/>' +
      '</g>' +
    '</svg>';

  // Section positions: where the mascot sits in the viewport
  // side: 'right' | 'left', vAlign: 'bottom' means bottom of section
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
    startIdleAnimations();
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
        YORKIE_SVG +
      '</div>';

    document.body.appendChild(el);
    mascotEl = el;

    // Start hidden, entrance happens on first section detection
    gsap.set(el, { opacity: 0, y: 40 });
  }

  // ============================
  // IDLE ANIMATIONS
  // ============================
  function startIdleAnimations() {
    if (typeof gsap === 'undefined') return;

    // Tail wag
    tailTween = gsap.to('.yorkie-tail', {
      rotation: 25,
      duration: 0.3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '10% 90%'
    });

    // Breathing
    gsap.to('.yorkie-body-group', {
      scaleY: 1.015,
      scaleX: 0.995,
      duration: 1.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 100%'
    });

    // Blink
    setInterval(function () {
      if (typeof gsap === 'undefined') return;
      gsap.timeline()
        .to('.yorkie-blink-left, .yorkie-blink-right', { attr: { ry: 8.5 }, duration: 0.08, ease: 'power2.in' })
        .to('.yorkie-blink-left, .yorkie-blink-right', { attr: { ry: 0 }, duration: 0.1, ease: 'power2.out' });
    }, 3500);

    // Ear twitch
    function earTwitch() {
      if (typeof gsap === 'undefined') return;
      var cls = Math.random() > 0.5 ? '.yorkie-ear-left' : '.yorkie-ear-right';
      gsap.to(cls, {
        rotation: (Math.random() > 0.5 ? -1 : 1) * 6,
        duration: 0.12,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete: function () { gsap.delayedCall(3 + Math.random() * 5, earTwitch); }
      });
    }
    gsap.delayedCall(2, earTwitch);
  }

  // ============================
  // SCROLL TRACKING — move mascot between sections
  // ============================
  function startScrollTracking() {
    // Find which section is most visible and move the mascot there
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
      // Clamp to viewport
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

      // Flip direction
      var svg = mascotEl.querySelector('.mascota__svg');
      if (svg) {
        svg.style.transform = target.side === 'left' ? 'scaleX(-1)' : '';
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
        // Section changed — animate the mascot to new position
        currentAnchor = key;

        // Excited tail
        if (tailTween) tailTween.timeScale(2.5);

        // Bounce-move to new position
        var inner = mascotEl.querySelector('.mascota__inner');
        gsap.timeline()
          // Squash before jump
          .to(inner, { scaleY: 0.85, scaleX: 1.15, duration: 0.1, transformOrigin: '50% 100%' })
          // Jump up & move
          .to(inner, { scaleY: 1.1, scaleX: 0.9, duration: 0.15, transformOrigin: '50% 100%' })
          .to(mascotEl, {
            left: target.x,
            top: target.y,
            duration: 0.5,
            ease: 'power2.inOut'
          }, '<')
          // Land squash
          .to(inner, { scaleY: 0.9, scaleX: 1.1, duration: 0.1, transformOrigin: '50% 100%' })
          // Settle
          .to(inner, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'elastic.out(1,0.5)', transformOrigin: '50% 100%' })
          .add(function () {
            if (tailTween) tailTween.timeScale(1);
            if (!phraseShown[key]) {
              phraseShown[key] = true;
              showBubble(visible.config.phrase);
            }
          });
      } else {
        // Same section — smoothly follow scroll position
        gsap.to(mascotEl, {
          left: target.x,
          top: target.y,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }

    // Throttled scroll handler
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

    // Initial position
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

      // Jump
      var inner = mascotEl.querySelector('.mascota__inner');
      if (inner) {
        gsap.timeline()
          .to(inner, { scaleX: 1.12, scaleY: 0.88, duration: 0.1, ease: 'power2.in', transformOrigin: '50% 100%' })
          .to(inner, { y: -20, scaleX: 0.92, scaleY: 1.08, duration: 0.25, ease: 'power2.out', transformOrigin: '50% 100%' })
          .to(inner, { y: 0, scaleX: 1.08, scaleY: 0.92, duration: 0.2, ease: 'power2.in', transformOrigin: '50% 100%' })
          .to(inner, { scaleX: 1, scaleY: 1, duration: 0.15, ease: 'elastic.out(1,0.5)', transformOrigin: '50% 100%' });
      }

      // Tongue
      gsap.timeline()
        .to('.yorkie-tongue', { opacity: 1, duration: 0.1, delay: 0.15 })
        .to('.yorkie-tongue', { opacity: 0, duration: 0.3, delay: 0.4 });

      // Happy eyes
      gsap.timeline()
        .to('.yorkie-blink-left, .yorkie-blink-right', { attr: { ry: 4 }, duration: 0.1, delay: 0.1 })
        .to('.yorkie-blink-left, .yorkie-blink-right', { attr: { ry: 0 }, duration: 0.15, delay: 0.3 });

      // Excited tail
      if (tailTween) {
        tailTween.timeScale(2.5);
        gsap.delayedCall(1.5, function () { if (tailTween) tailTween.timeScale(1); });
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
