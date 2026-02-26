/* ========================================
   MASCOTA VIRTUAL — Yorkshire Terrier
   Fully animated SVG dog with walk cycle,
   tail wag, blink, spin, and scroll companion
   ======================================== */

(function () {
  'use strict';

  var mascotReady = false;
  var mascotEl = null;
  var currentAnchor = null;
  var animState = 'idle'; // 'idle' | 'walk' | 'spin'
  var walkTL = null;
  var tailTween = null;
  var facingRight = true;

  /* =============================================
     SVG — Side-view Yorkshire Terrier (articulated)
     ============================================= */
  var DOG_SVG = '<svg class="mascota__svg" viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg">' +

    /* Shadow */
    '<ellipse class="dog-shadow" cx="110" cy="168" rx="50" ry="7" fill="#D4C4A8" opacity="0.3"/>' +

    /* ---- BACK LEGS (behind body) ---- */
    /* Back-left leg */
    '<g class="dog-leg dog-leg-bl" style="transform-origin:80px 118px">' +
      '<g class="dog-leg-upper" style="transform-origin:80px 118px">' +
        '<path d="M80 118 L76 145" stroke="#B8964E" stroke-width="10" stroke-linecap="round" fill="none"/>' +
        '<g class="dog-leg-lower" style="transform-origin:76px 145px">' +
          '<path d="M76 145 L78 165" stroke="#A8854A" stroke-width="8" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="78" cy="167" rx="7" ry="4" fill="#8B7355"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    /* Back-right leg */
    '<g class="dog-leg dog-leg-br" style="transform-origin:85px 118px">' +
      '<g class="dog-leg-upper" style="transform-origin:85px 118px">' +
        '<path d="M85 118 L82 145" stroke="#C4A46A" stroke-width="10" stroke-linecap="round" fill="none"/>' +
        '<g class="dog-leg-lower" style="transform-origin:82px 145px">' +
          '<path d="M82 145 L84 165" stroke="#B8964E" stroke-width="8" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="84" cy="167" rx="7" ry="4" fill="#8B7355"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    /* ---- TAIL ---- */
    '<g class="dog-tail" style="transform-origin:68px 95px">' +
      '<path d="M68 95 Q55 70 50 55 Q48 48 55 52 Q62 58 65 72 Q68 85 70 95" fill="#C4A46A"/>' +
      '<path d="M68 95 Q58 75 55 62 Q62 65 66 80 Z" fill="#D4B87A" opacity="0.5"/>' +
    '</g>' +

    /* ---- BODY ---- */
    '<g class="dog-body">' +
      /* Main body shape */
      '<ellipse cx="108" cy="108" rx="45" ry="28" fill="#D4B87A"/>' +
      /* Fur texture - darker back */
      '<ellipse cx="105" cy="102" rx="38" ry="18" fill="#C4A46A" opacity="0.6"/>' +
      /* Lighter belly */
      '<ellipse cx="112" cy="118" rx="32" ry="14" fill="#DABE7E" opacity="0.5"/>' +
      /* Body fur detail strokes */
      '<path d="M78 100 Q90 95 100 98" stroke="#B8964E" stroke-width="0.8" fill="none" opacity="0.3"/>' +
      '<path d="M85 105 Q100 100 115 103" stroke="#B8964E" stroke-width="0.8" fill="none" opacity="0.3"/>' +
      '<path d="M90 110 Q105 107 120 110" stroke="#B8964E" stroke-width="0.8" fill="none" opacity="0.3"/>' +
    '</g>' +

    /* Collar */
    '<ellipse cx="138" cy="105" rx="8" ry="14" fill="#BFA880" opacity="0.8"/>' +
    '<circle cx="140" cy="112" r="3" fill="#D4C4A8"/>' +

    /* ---- FRONT LEGS ---- */
    /* Front-left leg */
    '<g class="dog-leg dog-leg-fl" style="transform-origin:132px 120px">' +
      '<g class="dog-leg-upper" style="transform-origin:132px 120px">' +
        '<path d="M132 120 L128 148" stroke="#B8964E" stroke-width="10" stroke-linecap="round" fill="none"/>' +
        '<g class="dog-leg-lower" style="transform-origin:128px 148px">' +
          '<path d="M128 148 L130 165" stroke="#A8854A" stroke-width="8" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="130" cy="167" rx="7" ry="4" fill="#8B7355"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    /* Front-right leg */
    '<g class="dog-leg dog-leg-fr" style="transform-origin:137px 120px">' +
      '<g class="dog-leg-upper" style="transform-origin:137px 120px">' +
        '<path d="M137 120 L134 148" stroke="#C4A46A" stroke-width="10" stroke-linecap="round" fill="none"/>' +
        '<g class="dog-leg-lower" style="transform-origin:134px 148px">' +
          '<path d="M134 148 L136 165" stroke="#B8964E" stroke-width="8" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="136" cy="167" rx="7" ry="4" fill="#8B7355"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    /* ---- HEAD ---- */
    '<g class="dog-head" style="transform-origin:152px 88px">' +
      /* Neck fur */
      '<path d="M138 95 Q148 82 155 78 Q160 100 145 110Z" fill="#DABE7E"/>' +

      /* Head base */
      '<ellipse cx="158" cy="78" rx="22" ry="20" fill="#D4B87A"/>' +

      /* Snout */
      '<ellipse cx="172" cy="85" rx="14" ry="10" fill="#DABE7E"/>' +

      /* Top hair / tuft */
      '<path d="M142 68 Q148 52 158 50 Q165 52 168 60 Q162 55 155 56 Q148 58 142 68Z" fill="#C4A46A"/>' +
      '<path d="M155 50 Q162 45 168 48 Q172 55 168 60 Q165 52 160 50Z" fill="#B8964E" opacity="0.7"/>' +

      /* Hair bow */
      '<g transform="translate(155,52)">' +
        '<path d="M-5,-3 Q-8,-7 -2,-6 Q0,-8 2,-6 Q8,-7 5,-3 Q8,1 2,0 Q0,3 -2,0 Q-8,1 -5,-3Z" fill="#BFA880"/>' +
        '<circle cx="0" cy="-1.5" r="1.8" fill="#D4C4A8"/>' +
      '</g>' +

      /* Ear (back) */
      '<g class="dog-ear-back" style="transform-origin:148px 62px">' +
        '<path d="M148 72 Q140 55 145 45 Q150 42 152 50 Q153 60 150 70Z" fill="#B8964E"/>' +
        '<path d="M148 68 Q142 56 146 48 Q150 46 151 52 Q151 60 149 66Z" fill="#A8854A" opacity="0.6"/>' +
      '</g>' +

      /* Ear (front) */
      '<g class="dog-ear-front" style="transform-origin:162px 62px">' +
        '<path d="M162 72 Q168 52 165 42 Q160 40 158 48 Q157 58 160 70Z" fill="#C4A46A"/>' +
        '<path d="M161 68 Q166 54 164 46 Q161 44 159 50 Q159 58 160 66Z" fill="#B8964E" opacity="0.6"/>' +
      '</g>' +

      /* Eye */
      '<g class="dog-eye">' +
        '<ellipse cx="164" cy="78" rx="5" ry="5.5" fill="#2A1B0D"/>' +
        '<circle cx="162.5" cy="76.5" r="2" fill="#FFF" opacity="0.8"/>' +
        '<circle cx="165.5" cy="79" r="1" fill="#FFF" opacity="0.35"/>' +
        /* Blink overlay */
        '<ellipse class="dog-blink" cx="164" cy="78" rx="6" ry="0" fill="#D4B87A"/>' +
      '</g>' +

      /* Nose */
      '<ellipse cx="183" cy="82" rx="4" ry="3.5" fill="#2A1B0D"/>' +
      '<ellipse cx="182.5" cy="81.5" rx="1.5" ry="1" fill="#4A3520" opacity="0.4"/>' +

      /* Mouth */
      '<path class="dog-mouth" d="M178 87 Q181 90 184 87" fill="none" stroke="#8B6842" stroke-width="1" stroke-linecap="round"/>' +

      /* Tongue (hidden) */
      '<ellipse class="dog-tongue" cx="181" cy="91" rx="3" ry="4" fill="#E88B8B" opacity="0"/>' +

      /* Cheek highlight */
      '<circle cx="170" cy="86" r="4" fill="#E8C08A" opacity="0.25"/>' +
    '</g>' +

  '</svg>';

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
    buildAnimations();
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
        DOG_SVG +
      '</div>';
    document.body.appendChild(el);
    mascotEl = el;
    if (typeof gsap !== 'undefined') gsap.set(el, { opacity: 0, y: 40 });
  }

  /* =============================================
     ANIMATION SYSTEM
     ============================================= */
  function buildAnimations() {
    if (typeof gsap === 'undefined') return;
    buildIdleAnim();
    buildWalkCycle();
    startBlinking();
    startEarTwitch();
    setAnimState('idle');
  }

  /* --- IDLE: breathing, gentle tail wag --- */
  function buildIdleAnim() {
    // Breathing — body scales subtly
    gsap.to('.dog-body', {
      scaleY: 1.02, scaleX: 0.99,
      duration: 1.6, ease: 'sine.inOut',
      yoyo: true, repeat: -1,
      transformOrigin: '50% 100%'
    });

    // Tail — gentle wag
    tailTween = gsap.to('.dog-tail', {
      rotation: 15,
      duration: 0.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  /* --- WALK CYCLE --- */
  function buildWalkCycle() {
    var dur = 0.18; // duration per step phase

    walkTL = gsap.timeline({ repeat: -1, paused: true });

    // Diagonal gait: FL+BR together, FR+BL together
    // Phase 1: FL forward, BR forward
    walkTL
      // Front-left swings forward
      .to('.dog-leg-fl > .dog-leg-upper', { rotation: 20, duration: dur, ease: 'sine.inOut' }, 0)
      .to('.dog-leg-fl .dog-leg-lower', { rotation: -10, duration: dur, ease: 'sine.out' }, 0)
      // Back-right swings forward
      .to('.dog-leg-br > .dog-leg-upper', { rotation: 15, duration: dur, ease: 'sine.inOut' }, 0)
      .to('.dog-leg-br .dog-leg-lower', { rotation: -8, duration: dur, ease: 'sine.out' }, 0)
      // Front-right pushes back
      .to('.dog-leg-fr > .dog-leg-upper', { rotation: -18, duration: dur, ease: 'sine.inOut' }, 0)
      .to('.dog-leg-fr .dog-leg-lower', { rotation: 5, duration: dur, ease: 'sine.in' }, 0)
      // Back-left pushes back
      .to('.dog-leg-bl > .dog-leg-upper', { rotation: -15, duration: dur, ease: 'sine.inOut' }, 0)
      .to('.dog-leg-bl .dog-leg-lower', { rotation: 5, duration: dur, ease: 'sine.in' }, 0)
      // Body bob up
      .to('.dog-body, .dog-head, .dog-tail, .dog-leg', { y: -2, duration: dur, ease: 'sine.out' }, 0)

      // Phase 2: FR forward, BL forward (swap)
      .to('.dog-leg-fr > .dog-leg-upper', { rotation: 20, duration: dur, ease: 'sine.inOut' }, dur)
      .to('.dog-leg-fr .dog-leg-lower', { rotation: -10, duration: dur, ease: 'sine.out' }, dur)
      .to('.dog-leg-bl > .dog-leg-upper', { rotation: 15, duration: dur, ease: 'sine.inOut' }, dur)
      .to('.dog-leg-bl .dog-leg-lower', { rotation: -8, duration: dur, ease: 'sine.out' }, dur)
      .to('.dog-leg-fl > .dog-leg-upper', { rotation: -18, duration: dur, ease: 'sine.inOut' }, dur)
      .to('.dog-leg-fl .dog-leg-lower', { rotation: 5, duration: dur, ease: 'sine.in' }, dur)
      .to('.dog-leg-br > .dog-leg-upper', { rotation: -15, duration: dur, ease: 'sine.inOut' }, dur)
      .to('.dog-leg-br .dog-leg-lower', { rotation: 5, duration: dur, ease: 'sine.in' }, dur)
      // Body bob down
      .to('.dog-body, .dog-head, .dog-tail, .dog-leg', { y: 0, duration: dur, ease: 'sine.in' }, dur);

    // Walk tail is faster
    // (handled by tailTween timeScale when walking)
  }

  function setAnimState(state) {
    if (state === animState && state !== 'idle') return;
    animState = state;

    if (state === 'walk') {
      walkTL.play();
      if (tailTween) tailTween.timeScale(2.5);
    } else if (state === 'idle') {
      walkTL.pause();
      // Reset legs to neutral
      gsap.to('.dog-leg-upper', { rotation: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to('.dog-leg-lower', { rotation: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to('.dog-body, .dog-head, .dog-tail, .dog-leg', { y: 0, duration: 0.2 });
      if (tailTween) tailTween.timeScale(1);
    }
  }

  /* --- BLINK --- */
  function startBlinking() {
    function doBlink() {
      gsap.timeline()
        .to('.dog-blink', { attr: { ry: 6.5 }, duration: 0.07, ease: 'power2.in' })
        .to('.dog-blink', { attr: { ry: 0 }, duration: 0.09, ease: 'power2.out' })
        .add(function () {
          gsap.delayedCall(2.5 + Math.random() * 3, doBlink);
        });
    }
    gsap.delayedCall(1.5, doBlink);
  }

  /* --- EAR TWITCH --- */
  function startEarTwitch() {
    function twitch() {
      var ear = Math.random() > 0.5 ? '.dog-ear-front' : '.dog-ear-back';
      gsap.to(ear, {
        rotation: (Math.random() > 0.5 ? -1 : 1) * 8,
        duration: 0.1, ease: 'power2.out',
        yoyo: true, repeat: 1,
        onComplete: function () { gsap.delayedCall(3 + Math.random() * 5, twitch); }
      });
    }
    gsap.delayedCall(2, twitch);
  }

  /* --- SPIN --- */
  function doSpin(onDone) {
    setAnimState('idle');
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
      return { x: x, y: y, side: sd.config.side };
    }

    var firstReveal = true;
    var phraseShown = {};

    function flipDog(side) {
      var goRight = side === 'right';
      if (goRight === facingRight) return;
      facingRight = goRight;
      var svg = mascotEl.querySelector('.mascota__svg');
      if (svg) svg.style.transform = goRight ? '' : 'scaleX(-1)';
    }

    function updatePosition() {
      if (!mascotEl || typeof gsap === 'undefined') return;
      var vis = getMostVisibleSection();
      if (!vis) return;
      var target = getTargetPos(vis);
      if (!target) return;
      var key = vis.config.selector;

      flipDog(target.side);

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

        // Walk to new position
        setAnimState('walk');
        gsap.to(mascotEl, {
          left: target.x,
          top: target.y,
          duration: 0.7,
          ease: 'power2.inOut',
          onComplete: function () {
            setAnimState('idle');
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

      // Tongue flick
      gsap.timeline()
        .to('.dog-tongue', { opacity: 1, duration: 0.08, delay: 0.12 })
        .to('.dog-tongue', { opacity: 0, duration: 0.25, delay: 0.4 });

      // Happy eyes squint
      gsap.timeline()
        .to('.dog-blink', { attr: { ry: 3.5 }, duration: 0.08, delay: 0.1 })
        .to('.dog-blink', { attr: { ry: 0 }, duration: 0.12, delay: 0.35 });

      // Excited tail
      if (tailTween) {
        tailTween.timeScale(3);
        gsap.delayedCall(1.2, function () { if (tailTween) tailTween.timeScale(1); });
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
