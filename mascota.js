/* ========================================
   MASCOTA VIRTUAL — Animated 3D Fox
   Three.js + GLTFLoader scroll companion
   Animations: Survey (idle), Walk, Run
   ======================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function () {
  'use strict';

  var mascotReady = false;
  var mascotEl = null;
  var currentAnchor = null;

  // Three.js objects
  var renderer, scene, camera, model, mixer, clock;
  var animActions = {};
  var currentAction = null;
  var currentAnimName = '';

  var MODEL_PATH = 'assets/mascota.glb';
  var CANVAS_SIZE = 180;

  // Animation name mapping (Fox model clip names)
  var ANIM_NAMES = {
    idle:     'Survey',
    walk:     'Walk',
    run:      'Run'
  };

  /* =============================================
     Section anchors
     ============================================= */
  var sections = [
    { selector: '.hero',      phrase: '¡Bienvenido!' },
    { selector: '.countdown', phrase: '¡Ya falta poco!' },
    { selector: '.message',   phrase: '¡Qué emoción!' },
    { selector: '.fecha',     phrase: '¡No faltes!' },
    { selector: '.fiesta',    phrase: '¡A bailar!' }
  ];

  /* =============================================
     Waypoints — where the fox rests per section
     ============================================= */
  var waypoints = {
    '.hero':      { xAlign: 'right', xMargin: 12, yAnchor: 'bottom', yOffset: -20,  facing: 'left'  },
    '.countdown': { xAlign: 'right', xMargin: 8,  yAnchor: 'bottom', yOffset: -10,  facing: 'left'  },
    '.message':   { xAlign: 'left',  xMargin: 8,  yAnchor: 'bottom', yOffset: -10,  facing: 'right' },
    '.fecha':     { xAlign: 'right', xMargin: 4,  yAnchor: 'bottom', yOffset: -60,  facing: 'left'  },
    '.fiesta':    { xAlign: 'left',  xMargin: 8,  yAnchor: 'top',    yOffset: 180,  facing: 'right' }
  };

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
    initThreeJS();
    loadModel();
    bindTap();
    bindReactiveInteractions();
    bindModalVisibility();
  }

  /* =============================================
     Create DOM
     ============================================= */
  function createDOM() {
    var el = document.createElement('div');
    el.className = 'mascota';
    el.id = 'mascota';
    el.innerHTML =
      '<div class="mascota__bubble" id="mascota-bubble">' +
        '<span class="mascota__bubble-text" id="mascota-bubble-text"></span>' +
      '</div>' +
      '<div class="mascota__hearts" id="mascota-hearts"></div>' +
      '<div class="mascota__inner">' +
        '<canvas class="mascota__canvas" id="mascota-canvas"></canvas>' +
      '</div>';
    document.body.appendChild(el);
    mascotEl = el;
    if (typeof gsap !== 'undefined') gsap.set(el, { opacity: 0, y: 40 });
  }

  /* =============================================
     Three.js Setup
     ============================================= */
  function initThreeJS() {
    var canvas = document.getElementById('mascota-canvas');
    canvas.width = CANVAS_SIZE * window.devicePixelRatio;
    canvas.height = CANVAS_SIZE * window.devicePixelRatio;
    canvas.style.width = CANVAS_SIZE + 'px';
    canvas.style.height = CANVAS_SIZE + 'px';

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(CANVAS_SIZE, CANVAS_SIZE);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);

    // Lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    var dirLight = new THREE.DirectionalLight(0xfff4e0, 1.5);
    dirLight.position.set(2, 3, 2);
    scene.add(dirLight);

    var fillLight = new THREE.DirectionalLight(0xe0e8ff, 0.5);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);

    clock = new THREE.Clock();
  }

  /* =============================================
     Load GLB Model
     ============================================= */
  function loadModel() {
    var loader = new GLTFLoader();
    loader.load(
      MODEL_PATH,
      function (gltf) {
        model = gltf.scene;
        scene.add(model);

        // Compute bounding box and auto-frame the model
        var box = new THREE.Box3().setFromObject(model);
        var center = box.getCenter(new THREE.Vector3());
        var size = box.getSize(new THREE.Vector3());
        var maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit nicely in view
        var scale = 2.0 / maxDim;
        model.scale.setScalar(scale);

        // Recompute after scaling
        box.setFromObject(model);
        center = box.getCenter(new THREE.Vector3());
        size = box.getSize(new THREE.Vector3());

        // Position camera to frame the model (wider view for free-roaming)
        var dist = Math.max(size.x, size.y, size.z) * 2.6;
        camera.position.set(center.x + dist * 0.3, center.y + size.y * 0.15, center.z + dist);
        camera.lookAt(center.x, center.y - size.y * 0.05, center.z);

        // Disable frustum culling on skinned meshes
        model.traverse(function(child) {
          if (child.isMesh || child.isSkinnedMesh) {
            child.frustumCulled = false;
          }
        });

        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(function (clip) {
            var action = mixer.clipAction(clip);
            animActions[clip.name.toLowerCase()] = action;
          });
          playAnim('idle');
        }

        // Start render loop and scroll tracking
        animate();
        startScrollTracking();

        // Show the mascot
        if (typeof gsap !== 'undefined') {
          setTimeout(function () {
            gsap.to(mascotEl, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' });
          }, 100);
        }
      },
      undefined,
      function (err) {
        console.warn('Mascota: Could not load 3D model', err);
        var inner = mascotEl.querySelector('.mascota__inner');
        var canvas = document.getElementById('mascota-canvas');
        if (canvas) canvas.remove();
        var img = document.createElement('img');
        img.className = 'mascota__img';
        img.src = 'assets/yorkshire.svg';
        img.alt = 'Yorkito';
        img.draggable = false;
        inner.appendChild(img);
        startScrollTracking();
        if (typeof gsap !== 'undefined') {
          gsap.to(mascotEl, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' });
        }
      }
    );
  }

  /* =============================================
     Render Loop
     ============================================= */
  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
  }

  /* =============================================
     Play Animation by Name
     ============================================= */
  function playAnim(name, options) {
    var opts = options || {};
    var clipName = ANIM_NAMES[name] || name;
    var next = animActions[clipName.toLowerCase()];
    if (!mixer || !next) return;
    if (currentAnimName === name && !opts.force) return;

    currentAnimName = name;

    if (currentAction && currentAction !== next) {
      next.reset();
      if (opts.once) {
        next.setLoop(THREE.LoopOnce, 1);
        next.clampWhenFinished = true;
      } else {
        next.setLoop(THREE.LoopRepeat);
      }
      next.play();
      currentAction.crossFadeTo(next, 0.3, true);
      currentAction = next;

      if (opts.once && opts.returnTo) {
        mixer.addEventListener('finished', function onFinish(e) {
          if (e.action === next) {
            mixer.removeEventListener('finished', onFinish);
            playAnim(opts.returnTo);
          }
        });
      }
    } else if (!currentAction) {
      if (opts.once) {
        next.setLoop(THREE.LoopOnce, 1);
        next.clampWhenFinished = true;
      } else {
        next.setLoop(THREE.LoopRepeat);
      }
      next.play();
      currentAction = next;
    }
  }

  /* =============================================
     Flip model to face direction of movement
     ============================================= */
  function faceDirection(side) {
    if (!model || typeof gsap === 'undefined') return;
    var targetY = (side === 'left') ? -Math.PI * 0.3 : Math.PI * 0.3;
    gsap.to(model.rotation, {
      y: targetY,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /* =============================================
     Hop — used when moving between sections
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
      var wp = waypoints[sd.config.selector];
      if (!wp) return null;

      var rect = sd.el.getBoundingClientRect();
      var size = CANVAS_SIZE;
      var x, y;

      // Horizontal position
      if (wp.xAlign === 'right') {
        x = Math.min(rect.right - size - wp.xMargin, window.innerWidth - size - wp.xMargin);
      } else {
        x = Math.max(rect.left + wp.xMargin, wp.xMargin);
      }

      // Vertical position
      if (wp.yAnchor === 'bottom') {
        y = rect.bottom - size + wp.yOffset;
      } else {
        y = rect.top + wp.yOffset;
      }

      // Clamp to viewport
      y = Math.max(8, Math.min(window.innerHeight - size - 8, y));
      x = Math.max(4, Math.min(window.innerWidth - size - 4, x));

      return { x: x, y: y, facing: wp.facing };
    }

    var firstReveal = true;
    var phraseShown = {};
    var walkTimeout = null;
    var isWalking = false;
    var walkTween = null;

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
        faceDirection(target.facing);
        if (!phraseShown[key]) {
          phraseShown[key] = true;
          setTimeout(function () { showBubble(vis.config.phrase); }, 900);
        }
        currentAnchor = key;
        return;
      }

      if (key !== currentAnchor) {
        currentAnchor = key;

        // Cancel any in-progress walk
        if (walkTween) { walkTween.kill(); }
        if (walkTimeout) clearTimeout(walkTimeout);

        // Determine travel direction from current position
        var currentLeft = parseFloat(gsap.getProperty(mascotEl, 'left')) || 0;
        var currentTop = parseFloat(gsap.getProperty(mascotEl, 'top')) || 0;
        var dx = target.x - currentLeft;
        var dy = target.y - currentTop;

        // Face travel direction (or resting direction if mostly vertical)
        var travelDir;
        if (Math.abs(dx) > 20) {
          travelDir = (dx > 0) ? 'right' : 'left';
        } else {
          travelDir = target.facing;
        }

        // Duration proportional to distance (0.8s – 2.0s)
        var dist = Math.sqrt(dx * dx + dy * dy);
        var duration = Math.max(0.8, Math.min(2.0, dist / 300));

        // Start walk animation and face travel direction
        playAnim('walk');
        faceDirection(travelDir);
        isWalking = true;

        // Tween position
        walkTween = gsap.to(mascotEl, {
          left: target.x,
          top: target.y,
          duration: duration,
          ease: 'power2.inOut',
          onComplete: function () {
            isWalking = false;
            walkTween = null;

            // On arrival: face resting direction, idle, hop
            faceDirection(target.facing);
            walkTimeout = setTimeout(function () {
              playAnim('idle');
              doHop();
            }, 150);

            // Show section phrase
            if (!phraseShown[key]) {
              phraseShown[key] = true;
              setTimeout(function () { showBubble(vis.config.phrase); }, 400);
            }
          }
        });
      } else if (!isWalking) {
        // Same section, gentle repositioning (e.g. on resize)
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

      // Every 5th tap → run!
      if (tapCount % 5 === 0) {
        playAnim('run', { once: true, returnTo: 'idle', force: true });
        showBubble('¡Guau guau!');
        doHeartBurst();
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

      showBubble(tapPhrases[Math.floor(Math.random() * tapPhrases.length)]);

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
     REACTIVE INTERACTIONS
     ============================================= */
  function bindReactiveInteractions() {
    var btnConfirmar = document.getElementById('btn-confirmar');
    if (btnConfirmar) {
      btnConfirmar.addEventListener('click', function () {
        playAnim('run', { once: true, returnTo: 'idle', force: true });
        showBubble('¡Sí, confirma!');
        doHeartBurst();
      });
    }

    var btnPlaylist = document.getElementById('btn-playlist');
    if (btnPlaylist) {
      btnPlaylist.addEventListener('click', function () {
        playAnim('run', { once: true, returnTo: 'idle', force: true });
        showBubble('¡A bailar!');
      });
    }
  }

  /* =============================================
     MODAL VISIBILITY — hide mascot during modals
     ============================================= */
  function bindModalVisibility() {
    var observer = new MutationObserver(function () {
      if (!mascotEl || typeof gsap === 'undefined') return;
      var isModalOpen = document.body.classList.contains('modal-open');
      if (isModalOpen) {
        gsap.to(mascotEl, { opacity: 0, duration: 0.3, ease: 'power2.in', pointerEvents: 'none' });
      } else {
        gsap.to(mascotEl, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.3, pointerEvents: 'auto' });
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
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
