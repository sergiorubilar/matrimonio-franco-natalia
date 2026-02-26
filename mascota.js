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
     Matches the real Yorkie: big dark eyes, golden
     tan face, steel-grey body, flowing fur, perky ears
     ============================================= */
  var DOG_SVG = '<svg class="mascota__svg" viewBox="0 0 180 170" xmlns="http://www.w3.org/2000/svg">' +

    /* Shadow */
    '<ellipse class="dog-shadow" cx="90" cy="162" rx="38" ry="5" fill="#8B7355" opacity="0.2"/>' +

    /* ---- TAIL (behind everything) ---- */
    '<g class="dog-tail" style="transform-origin:48px 82px">' +
      '<path d="M48 82 Q36 60 34 45 Q33 36 38 42 Q44 50 46 62 Q48 74 50 82" fill="#C8873E"/>' +
      '<path d="M48 82 Q40 65 38 52 Q43 58 46 68 Q48 76 50 82Z" fill="#DBA860" opacity="0.5"/>' +
      /* Fur wisps */
      '<path d="M36 48 Q32 42 34 38" stroke="#B87730" stroke-width="1.5" fill="none" opacity="0.4"/>' +
      '<path d="M40 56 Q36 50 38 46" stroke="#D4924E" stroke-width="1.2" fill="none" opacity="0.35"/>' +
      '<path d="M35 44 Q31 40 33 36" stroke="#C8873E" stroke-width="1" fill="none" opacity="0.3"/>' +
    '</g>' +

    /* ---- BACK LEGS (behind body) ---- */
    '<g class="dog-leg dog-leg-bl" style="transform-origin:68px 112px">' +
      '<g class="dog-leg-upper" style="transform-origin:68px 112px">' +
        '<path d="M68 112 Q66 128 64 140" stroke="#B87730" stroke-width="12" stroke-linecap="round" fill="none"/>' +
        /* Fur fringe */
        '<path d="M61 118 Q57 122 59 128" stroke="#C8873E" stroke-width="2.5" fill="none" opacity="0.4"/>' +
        '<path d="M75 120 Q78 125 76 130" stroke="#A06830" stroke-width="2" fill="none" opacity="0.3"/>' +
        '<g class="dog-leg-lower" style="transform-origin:64px 140px">' +
          '<path d="M64 140 Q65 150 66 158" stroke="#D4924E" stroke-width="10" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="66" cy="161" rx="8" ry="4.5" fill="#C8873E"/>' +
          '<path d="M60 161 Q62 158 64 161" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M64 161 Q66 158 68 161" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M68 161 Q70 158 72 161" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    '<g class="dog-leg dog-leg-br" style="transform-origin:74px 112px">' +
      '<g class="dog-leg-upper" style="transform-origin:74px 112px">' +
        '<path d="M74 112 Q72 128 70 140" stroke="#C8873E" stroke-width="12" stroke-linecap="round" fill="none"/>' +
        '<g class="dog-leg-lower" style="transform-origin:70px 140px">' +
          '<path d="M70 140 Q71 150 72 158" stroke="#DBA860" stroke-width="10" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="72" cy="161" rx="8" ry="4.5" fill="#D4924E"/>' +
          '<path d="M66 161 Q68 158 70 161" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M70 161 Q72 158 74 161" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M74 161 Q76 158 78 161" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    /* ---- BODY ---- */
    '<g class="dog-body">' +
      /* Main body — warm golden tan base */
      '<ellipse cx="92" cy="100" rx="38" ry="24" fill="#D4924E"/>' +
      /* Darker saddle on the back (subtle steel-brown) */
      '<ellipse cx="88" cy="94" rx="32" ry="15" fill="#8B7355" opacity="0.55"/>' +
      '<ellipse cx="85" cy="92" rx="26" ry="10" fill="#6B5B50" opacity="0.35"/>' +
      /* Lighter belly / underside */
      '<ellipse cx="96" cy="112" rx="28" ry="10" fill="#DBA860" opacity="0.55"/>' +
      '<ellipse cx="98" cy="116" rx="20" ry="7" fill="#E8C080" opacity="0.3"/>' +

      /* Chest fur — lighter golden, flowing */
      '<path d="M120 90 Q128 100 127 112 Q125 120 120 124 Q117 116 118 106 Q119 96 120 90Z" fill="#DBA860"/>' +
      '<path d="M122 92 Q128 104 127 114 Q125 108 124 100 Q123 95 122 92Z" fill="#E8C080" opacity="0.5"/>' +

      /* Fur texture — flowing lines */
      '<path d="M60 94 Q72 90 85 92" stroke="#7A6A5E" stroke-width="0.9" fill="none" opacity="0.3"/>' +
      '<path d="M64 100 Q78 96 92 98" stroke="#8B7355" stroke-width="0.8" fill="none" opacity="0.25"/>' +
      '<path d="M68 106 Q82 103 98 105" stroke="#7A6A5E" stroke-width="0.7" fill="none" opacity="0.2"/>' +
      /* Side fur wisps */
      '<path d="M66 115 Q62 122 64 128" stroke="#B87730" stroke-width="1.8" fill="none" opacity="0.3"/>' +
      '<path d="M74 117 Q71 124 73 130" stroke="#C8873E" stroke-width="1.5" fill="none" opacity="0.25"/>' +
      '<path d="M82 118 Q80 125 82 131" stroke="#B87730" stroke-width="1.2" fill="none" opacity="0.2"/>' +
      '<path d="M108 116 Q106 123 108 129" stroke="#D4924E" stroke-width="1.5" fill="none" opacity="0.25"/>' +
      '<path d="M114 114 Q112 121 114 127" stroke="#DBA860" stroke-width="1.2" fill="none" opacity="0.2"/>' +
    '</g>' +

    /* ---- FRONT LEGS ---- */
    '<g class="dog-leg dog-leg-fl" style="transform-origin:112px 114px">' +
      '<g class="dog-leg-upper" style="transform-origin:112px 114px">' +
        '<path d="M112 114 Q110 130 108 142" stroke="#D4924E" stroke-width="12" stroke-linecap="round" fill="none"/>' +
        '<path d="M105 120 Q101 124 103 130" stroke="#DBA860" stroke-width="2.5" fill="none" opacity="0.35"/>' +
        '<path d="M118 122 Q121 126 119 132" stroke="#C8873E" stroke-width="2" fill="none" opacity="0.3"/>' +
        '<g class="dog-leg-lower" style="transform-origin:108px 142px">' +
          '<path d="M108 142 Q109 152 110 160" stroke="#DBA860" stroke-width="10" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="110" cy="163" rx="8" ry="4.5" fill="#D4924E"/>' +
          '<path d="M104 163 Q106 160 108 163" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M108 163 Q110 160 112 163" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M112 163 Q114 160 116 163" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    '<g class="dog-leg dog-leg-fr" style="transform-origin:118px 114px">' +
      '<g class="dog-leg-upper" style="transform-origin:118px 114px">' +
        '<path d="M118 114 Q116 130 114 142" stroke="#DBA860" stroke-width="12" stroke-linecap="round" fill="none"/>' +
        '<g class="dog-leg-lower" style="transform-origin:114px 142px">' +
          '<path d="M114 142 Q115 152 116 160" stroke="#E8C080" stroke-width="10" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="116" cy="163" rx="8" ry="4.5" fill="#DBA860"/>' +
          '<path d="M110 163 Q112 160 114 163" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M114 163 Q116 160 118 163" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
          '<path d="M118 163 Q120 160 122 163" stroke="#8B5A2B" stroke-width="0.7" fill="none"/>' +
        '</g>' +
      '</g>' +
    '</g>' +

    /* ---- HEAD (large, proportional for cute Yorkie) ---- */
    '<g class="dog-head" style="transform-origin:138px 68px">' +

      /* Neck / chest fur connection */
      '<path d="M122 85 Q132 72 140 65 Q145 82 135 98Z" fill="#DBA860"/>' +
      '<path d="M124 88 Q130 80 135 74 Q137 85 132 95Z" fill="#E8C080" opacity="0.5"/>' +

      /* Head base — golden tan, larger */
      '<ellipse cx="142" cy="58" rx="28" ry="26" fill="#D4924E"/>' +

      /* Darker top of head */
      '<ellipse cx="140" cy="50" rx="22" ry="16" fill="#C8873E" opacity="0.5"/>' +
      '<ellipse cx="138" cy="48" rx="16" ry="10" fill="#B87730" opacity="0.3"/>' +

      /* Forehead fur texture */
      '<path d="M128 52 Q136 48 145 50" stroke="#B87730" stroke-width="1" fill="none" opacity="0.35"/>' +
      '<path d="M130 56 Q139 52 148 55" stroke="#C8873E" stroke-width="0.8" fill="none" opacity="0.3"/>' +

      /* Cheek / muzzle area — lighter golden */
      '<ellipse cx="152" cy="65" rx="16" ry="14" fill="#DBA860"/>' +
      '<ellipse cx="154" cy="67" rx="12" ry="10" fill="#E8C080" opacity="0.5"/>' +

      /* Snout — lightest tan */
      '<ellipse cx="160" cy="64" rx="10" ry="8" fill="#E8C080"/>' +
      '<ellipse cx="161" cy="66" rx="7" ry="5.5" fill="#F0D090" opacity="0.4"/>' +

      /* Face fur wisps */
      '<path d="M130 70 Q125 78 127 86" stroke="#C8873E" stroke-width="1.8" fill="none" opacity="0.4"/>' +
      '<path d="M134 72 Q130 80 132 88" stroke="#D4924E" stroke-width="1.5" fill="none" opacity="0.35"/>' +
      '<path d="M156 72 Q160 80 158 88" stroke="#DBA860" stroke-width="1.5" fill="none" opacity="0.3"/>' +
      '<path d="M152 74 Q154 82 152 90" stroke="#C8873E" stroke-width="1.2" fill="none" opacity="0.25"/>' +

      /* --- Top hair / tuft --- */
      '<path d="M126 46 Q132 30 144 25 Q150 28 154 36 Q148 30 140 32 Q132 35 126 46Z" fill="#C8873E"/>' +
      '<path d="M130 42 Q136 32 146 28 Q142 32 136 38 Q133 40 130 42Z" fill="#B87730" opacity="0.6"/>' +
      '<path d="M144 25 Q152 20 158 28 Q160 36 156 42 Q154 32 150 28 Q147 25 144 25Z" fill="#8B5A2B" opacity="0.4"/>' +
      '<path d="M128 42 Q124 36 126 30" stroke="#B87730" stroke-width="1.8" fill="none" opacity="0.35"/>' +
      '<path d="M154 34 Q158 28 156 24" stroke="#8B5A2B" stroke-width="1.5" fill="none" opacity="0.3"/>' +

      /* --- Ear (back) — big V-shape --- */
      '<g class="dog-ear-back" style="transform-origin:132px 42px">' +
        '<path d="M132 52 Q124 36 126 18 Q130 10 134 14 Q138 22 136 40 L134 52Z" fill="#8B5A2B"/>' +
        '<path d="M133 48 Q126 34 128 20 Q131 14 133 18 Q136 28 135 44Z" fill="#7A4E25" opacity="0.5"/>' +
        '<path d="M132 42 Q128 32 129 22 Q131 16 132 22 Q134 30 133 40Z" fill="#A06830" opacity="0.35"/>' +
        /* Ear edge fur */
        '<path d="M126 18 Q123 12 125 8" stroke="#6B4020" stroke-width="1.2" fill="none" opacity="0.3"/>' +
        '<path d="M130 14 Q128 8 129 5" stroke="#7A4E25" stroke-width="1" fill="none" opacity="0.25"/>' +
      '</g>' +

      /* --- Ear (front) — big V-shape --- */
      '<g class="dog-ear-front" style="transform-origin:150px 42px">' +
        '<path d="M150 52 Q158 34 156 16 Q152 8 148 12 Q144 20 146 40 L148 52Z" fill="#C8873E"/>' +
        '<path d="M149 48 Q156 33 155 19 Q152 12 149 16 Q146 26 147 44Z" fill="#B87730" opacity="0.5"/>' +
        '<path d="M150 42 Q154 30 153 20 Q152 14 150 20 Q148 28 149 40Z" fill="#DBA860" opacity="0.3"/>' +
        '<path d="M156 16 Q159 10 157 6" stroke="#8B5A2B" stroke-width="1.2" fill="none" opacity="0.3"/>' +
        '<path d="M152 12 Q154 6 153 3" stroke="#B87730" stroke-width="1" fill="none" opacity="0.25"/>' +
      '</g>' +

      /* --- Eyes (big, dark, expressive) --- */
      '<g class="dog-eye">' +
        '<ellipse cx="148" cy="58" rx="8.5" ry="9" fill="#1A1110"/>' +
        /* Large highlight — top left */
        '<ellipse cx="145" cy="55.5" rx="3.2" ry="3.5" fill="#FFF" opacity="0.85"/>' +
        /* Small highlight — bottom right */
        '<circle cx="150.5" cy="60.5" r="1.8" fill="#FFF" opacity="0.4"/>' +
        /* Subtle warm ring */
        '<ellipse cx="148" cy="58" rx="8.5" ry="9" fill="none" stroke="#3A2515" stroke-width="0.8" opacity="0.4"/>' +
        /* Blink overlay */
        '<ellipse class="dog-blink" cx="148" cy="58" rx="9" ry="0" fill="#D4924E"/>' +
      '</g>' +

      /* --- Nose (round, black) --- */
      '<ellipse cx="168" cy="63" rx="5" ry="4.5" fill="#1A1110"/>' +
      '<ellipse cx="167" cy="62" rx="2" ry="1.3" fill="#3A2A1A" opacity="0.4"/>' +
      '<circle cx="166.5" cy="61.5" r="1.2" fill="#FFF" opacity="0.15"/>' +

      /* --- Mouth (happy smile) --- */
      '<path class="dog-mouth" d="M163 70 Q166 73 170 70" fill="none" stroke="#7A4E25" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="M161 69 Q163 70 163 70" stroke="#7A4E25" stroke-width="0.8" fill="none" opacity="0.5"/>' +

      /* Tongue (hidden) */
      '<ellipse class="dog-tongue" cx="166" cy="74" rx="3.5" ry="5" fill="#E88B8B" opacity="0"/>' +
      '<path class="dog-tongue-line" d="M166 71 L166 77" stroke="#D47070" stroke-width="0.5" opacity="0"/>' +

      /* Cheek highlight */
      '<circle cx="155" cy="68" r="5" fill="#F0D090" opacity="0.12"/>' +

      /* Chin/beard fur wisps (Yorkie signature) */
      '<path d="M156 76 Q153 84 155 92" stroke="#DBA860" stroke-width="2" fill="none" opacity="0.4"/>' +
      '<path d="M160 76 Q158 84 160 92" stroke="#E8C080" stroke-width="1.8" fill="none" opacity="0.35"/>' +
      '<path d="M152 74 Q148 82 150 90" stroke="#C8873E" stroke-width="1.8" fill="none" opacity="0.35"/>' +
      '<path d="M164 74 Q163 82 164 88" stroke="#DBA860" stroke-width="1.5" fill="none" opacity="0.3"/>' +
      '<path d="M148 72 Q144 80 146 87" stroke="#B87730" stroke-width="1.5" fill="none" opacity="0.3"/>' +

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
        .to('.dog-blink', { attr: { ry: 9 }, duration: 0.07, ease: 'power2.in' })
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
        .to('.dog-tongue, .dog-tongue-line', { opacity: 1, duration: 0.08, delay: 0.12 })
        .to('.dog-tongue, .dog-tongue-line', { opacity: 0, duration: 0.25, delay: 0.4 });

      // Happy eyes squint
      gsap.timeline()
        .to('.dog-blink', { attr: { ry: 5 }, duration: 0.08, delay: 0.1 })
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
