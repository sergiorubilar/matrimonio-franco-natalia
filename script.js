/* ========================================
   WEDDING LANDING PAGE — Natalia & Franco
   ======================================== */

(function () {
  'use strict';

  // ============================
  // CONFIGURACIÓN
  // ============================
  // Pega aquí la URL de tu Google Apps Script desplegado
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYSHCf-zHTPKuvnms_6e_miHZzn3lAAZIp1wtHepb0kUAeImIzTS-9ZOlUnVqOLmXr/exec';

  // ============================
  // TOKEN DEL INVITADO
  // ============================
  var urlParams = new URLSearchParams(window.location.search);
  var guestToken = urlParams.get('token');
  var guestInfo = null;

  function isConfigured() {
    return APPS_SCRIPT_URL !== 'PEGAR_URL_DEL_APPS_SCRIPT_AQUI';
  }

  // ============================
  // PAGE REVEAL ANIMATIONS
  // ============================
  var revealHero = null;

  function initPageAnimations() {
    if (typeof gsap === 'undefined') return;

    // --- Initial hidden states: Hero ---
    gsap.set('.hero__photo', { opacity: 0, scale: 1.1 });
    gsap.set('.hero__photo img', { scale: 1.15 });
    gsap.set('.hero__date-line', { scaleX: 0 });
    gsap.set('.hero__date-text', { opacity: 0, y: 10, filter: 'blur(4px)' });
    gsap.set('.hero__names', { opacity: 0, y: 40, filter: 'blur(6px)' });
    gsap.set('.hero__line-bottom', { scaleX: 0 });
    gsap.set('.hero__espiga--left', { opacity: 0, x: -50, rotation: -8 });
    gsap.set('.hero__espiga--right', { opacity: 0, x: 50, rotation: 8 });

    // --- Initial hidden states: Countdown ---
    gsap.set('.countdown__bubble', { opacity: 0, y: 30, scale: 0.9 });
    gsap.set('.countdown__vector', { opacity: 0 });

    // --- Initial hidden states: Message ---
    gsap.set('.message__text', { opacity: 0, y: 25, filter: 'blur(4px)' });
    gsap.set('.message__leaf', { opacity: 0, scale: 0.8, rotation: -10 });

    // --- Initial hidden states: Fecha ---
    gsap.set('.fecha__title', { opacity: 0, y: 25 });
    gsap.set('.fecha__day, .fecha__venue, .fecha__city', { opacity: 0, y: 20 });
    gsap.set('.fecha .btn, .fecha__status', { opacity: 0, y: 15 });

    // --- Initial hidden states: Fiesta ---
    gsap.set('.fiesta__title', { opacity: 0, y: 25 });
    gsap.set('.fiesta__card', { opacity: 0, y: 40 });
    gsap.set('.fiesta__deco', { opacity: 0 });

    // --- Hero reveal timeline (spectacular after envelope) ---
    revealHero = function () {
      gsap.timeline()
        // Photo fades in with zoom-out (Ken Burns)
        .to('.hero__photo', { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 0)
        .to('.hero__photo img', { scale: 1, duration: 4, ease: 'power1.out' }, 0)

        // Date lines extend
        .to('.hero__date-line', { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0.5)

        // Date text clears from blur
        .to('.hero__date-text', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, 0.7)

        // Names rise up from blur
        .to('.hero__names', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' }, 0.8)

        // Bottom line
        .to('.hero__line-bottom', { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.4)

        // Espigas sweep in with rotation
        .to('.hero__espiga--left', { opacity: 1, x: 0, rotation: 0, duration: 1.5, ease: 'power2.out' }, 0.6)
        .to('.hero__espiga--right', { opacity: 1, x: 0, rotation: 0, duration: 1.5, ease: 'power2.out' }, 0.8);
    };

    // If no intro, reveal hero immediately
    if (!document.getElementById('intro')) {
      revealHero();
    }

    // --- Scroll-triggered section reveals ---
    var sectionDefs = [
      {
        el: '.countdown',
        anim: function () {
          gsap.timeline()
            .to('.countdown__vector', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)
            .to('.countdown__bubble', { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'back.out(1.6)' }, 0.15);
        }
      },
      {
        el: '.message',
        anim: function () {
          gsap.timeline()
            .to('.message__leaf', { opacity: 0.5, scale: 1, rotation: 0, duration: 1.2, ease: 'power2.out' }, 0)
            .to('.message__text', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }, 0.2);
        }
      },
      {
        el: '.fecha',
        anim: function () {
          gsap.timeline()
            .to('.fecha__title', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0)
            .to('.fecha__day', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.15)
            .to('.fecha__venue', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.25)
            .to('.fecha__city', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.35)
            .to('.fecha .btn, .fecha__status', { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, 0.45);
        }
      },
      {
        el: '.fiesta',
        anim: function () {
          gsap.timeline()
            .to('.fiesta__title', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0)
            .to('.fiesta__card', { opacity: 1, y: 0, duration: 1, stagger: 0.25, ease: 'back.out(1.2)' }, 0.2)
            .to('.fiesta__deco--grapes', { opacity: 0.4, duration: 1.4, ease: 'power1.inOut' }, 0.3)
            .to('.fiesta__deco--cart', { opacity: 0.25, duration: 1.4, ease: 'power1.inOut' }, 0.5);
        }
      }
    ];

    var scrollObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var fn = entry.target._revealAnim;
        if (fn) fn();
        scrollObs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    sectionDefs.forEach(function (def) {
      var el = document.querySelector(def.el);
      if (el) {
        el._revealAnim = def.anim;
        scrollObs.observe(el);
      }
    });
  }

  // ============================
  // INTRO ANIMATION — BURLAP ENVELOPE
  // ============================
  function initIntro() {
    var intro = document.getElementById('intro');
    var canvas = document.getElementById('intro-canvas');
    var tap = document.getElementById('intro-tap');
    var flash = intro && intro.querySelector('.intro__flash');
    var seal = document.getElementById('intro-seal');
    var sealImg = seal && seal.querySelector('.intro__seal-img');
    var sealGlow = seal && seal.querySelector('.intro__seal-glow');
    var flapLeft = document.getElementById('intro-flap-left');
    var flapRight = document.getElementById('intro-flap-right');
    var glow = intro && intro.querySelector('.intro__glow');

    if (!intro || !canvas || typeof gsap === 'undefined') return;

    // ============================
    // CANVAS — GOLDEN DUST MOTES
    // ============================
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleAlpha = { value: 0 };
    var particleRunning = true;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (var i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 1 + Math.random() * 3.5,
        alpha: 0.08 + Math.random() * 0.35,
        drift: 0.15 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.004,
        vy: -0.08 - Math.random() * 0.25
      });
    }

    function drawParticles(time) {
      if (!particleRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var xOff = Math.sin(time * p.speed + p.phase) * 35 * p.drift;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }

        var cx = p.x + xOff;
        var cy = p.y;
        var a = p.alpha * particleAlpha.value;
        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.r);
        grad.addColorStop(0, 'rgba(220,195,150,' + a.toFixed(3) + ')');
        grad.addColorStop(0.6, 'rgba(191,168,128,' + (a * 0.4).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(191,168,128,0)');

        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      requestAnimationFrame(drawParticles);
    }
    requestAnimationFrame(drawParticles);

    // ============================
    // PHASE 1: CINEMATIC ENTRANCE
    // ============================
    var envelope = document.getElementById('intro-envelope');

    // Initial states — everything hidden
    gsap.set(envelope, { opacity: 0 });
    gsap.set(seal, { opacity: 0, y: 10 });
    gsap.set(sealGlow, { opacity: 0, scale: 0.6 });
    gsap.set(tap, { opacity: 0, y: 8 });

    var entranceDone = false;
    var entranceTL = gsap.timeline({
      delay: 0.6,
      onComplete: function () { entranceDone = true; }
    });

    entranceTL
      // Dust + envelope appear together
      .to(particleAlpha, { value: 1, duration: 1.5, ease: 'power1.inOut' }, 0)
      .to(envelope, { opacity: 1, duration: 1.5, ease: 'power1.inOut' }, 0)

      // Seal fades in
      .to(seal, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 1.0)
      .to(sealGlow, { opacity: 0.7, scale: 1, duration: 1, ease: 'power1.inOut' }, 1.2)

      // Text appears
      .to(tap, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.8);

    // Seal glow breathes
    var sealPulse = gsap.to(sealGlow, {
      scale: 1.25, opacity: 0.35, duration: 2.5,
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2.8
    });

    // Tap text breathe
    var tapPulse = gsap.to(tap, {
      opacity: 0.7, duration: 2.5, ease: 'sine.inOut',
      repeat: -1, yoyo: true, delay: 3.5
    });

    // ============================
    // CLICK — CINEMATIC OPEN & TRANSITION
    // ============================
    var phase = 0;

    intro.addEventListener('click', function () {
      if (phase !== 0 || !entranceDone) return;
      phase = 1;

      // Kill all looping tweens cleanly
      sealPulse.kill();
      tapPulse.kill();
      gsap.killTweensOf(tap);
      gsap.killTweensOf(seal);
      gsap.killTweensOf(sealGlow);

      var openTL = gsap.timeline();

      openTL
        // Tap + seal fade together
        .to(tap, { opacity: 0, duration: 0.3 }, 0)
        .to(sealGlow, { scale: 2, opacity: 0, duration: 1, ease: 'power1.out' }, 0)
        .to(seal, { opacity: 0, y: -6, duration: 0.8, ease: 'power2.inOut' }, 0.1)

        // Flaps part + golden glow emerges
        .to(glow, { scale: 1, opacity: 0.6, duration: 1.4, ease: 'power1.out' }, 0.7)
        .to(flapLeft, { x: '-105%', duration: 1.6, ease: 'power2.inOut' }, 0.7)
        .to(flapRight, { x: '105%', duration: 1.6, ease: 'power2.inOut' }, 0.75)

        // Particles swell then dissolve
        .to(particleAlpha, { value: 1.3, duration: 0.6, ease: 'power1.in' }, 1.0)
        .to(particleAlpha, { value: 0, duration: 0.7, ease: 'power1.in' }, 1.6)
        .to(glow, { scale: 2, opacity: 0, duration: 0.8, ease: 'power1.in' }, 1.8)

        // Fade to cream
        .to(flash, { opacity: 1, duration: 0.8, ease: 'power1.inOut' }, 2.0)

        // Remove intro and reveal the page
        .add(function () {
          particleRunning = false;
          window.removeEventListener('resize', resizeCanvas);
          intro.remove();
          document.documentElement.classList.remove('intro-active');
          if (revealHero) revealHero();
        }, 2.8);
    });
  }

  // ============================
  // PERSONALIZACIÓN & ARRANQUE
  // ============================
  function personalizeContent() {
    if (!guestInfo) return;

    // Personalizar título del formulario
    var titleEl = document.querySelector('#screen-confirmar .fullscreen__title');
    if (titleEl && guestInfo.invitado) {
      titleEl.innerHTML = guestInfo.invitado.split(' ')[0] + ',<br>confirma tu<br>asistencia';
    }

    updateConfirmButton();
    updateFormState();
  }

  function updateConfirmButton() {
    var btn = document.getElementById('btn-confirmar');
    var statusEl = document.getElementById('confirm-status');
    if (!btn || !statusEl) return;

    if (!guestInfo || !guestInfo.confirmacion) {
      statusEl.style.display = 'none';
      statusEl.className = 'fecha__status';
      btn.textContent = 'Confirmar asistencia';
      btn.className = 'btn btn--primary';
      return;
    }

    statusEl.style.display = '';
    statusEl.className = 'fecha__status';

    if (guestInfo.confirmacion === 'TRUE') {
      statusEl.textContent = 'Asistencia confirmada';
      statusEl.classList.add('fecha__status--confirmed');
    } else {
      statusEl.textContent = 'No podrás asistir';
      statusEl.classList.add('fecha__status--declined');
    }

    btn.textContent = 'Modificar respuesta';
    btn.className = 'btn btn--link';
  }

  function updateFormState() {
    if (!guestInfo || !guestInfo.confirmacion) return;

    var formEl = document.getElementById('form-confirmacion');
    if (!formEl) return;

    var statusMsg = guestInfo.confirmacion === 'TRUE'
      ? 'Ya confirmaste tu asistencia'
      : 'Registramos que no podrás asistir';

    formEl.innerHTML =
      '<div style="text-align:center;padding:24px 0;">' +
        '<p style="font-size:20px;color:#BFA880;margin-bottom:12px;">' + statusMsg + '</p>' +
        '<p style="font-size:14px;color:#999;">Si deseas cambiar tu respuesta, presiona el botón de abajo.</p>' +
        '<button type="button" class="btn btn--link" id="btn-change-response" style="margin-top:16px;font-size:14px;">Cambiar respuesta</button>' +
      '</div>';

    document.getElementById('btn-change-response').addEventListener('click', function () {
      formEl.innerHTML = originalFormHTML;
      rebindFormEvents();
    });
  }

  // Guardar HTML original del form para poder restaurarlo
  var originalFormHTML = document.getElementById('form-confirmacion').innerHTML;

  function rebindFormEvents() {
    var formEl = document.getElementById('form-confirmacion');
    var si = document.getElementById('alergia-si');
    var no = document.getElementById('alergia-no');
    var gc = document.getElementById('group-cual');
    var ad = document.getElementById('alergia-detalle');
    var submitBtn = formEl.querySelector('.btn--submit');

    gc.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;

    si.addEventListener('change', function () {
      gc.style.display = '';
      ad.disabled = false;
      checkFormComplete(formEl, submitBtn);
    });
    no.addEventListener('change', function () {
      gc.style.display = 'none';
      ad.disabled = true;
      ad.value = '';
      checkFormComplete(formEl, submitBtn);
    });

    formEl.querySelectorAll('input[type="radio"]').forEach(function (r) {
      r.addEventListener('change', function () { checkFormComplete(formEl, submitBtn); });
    });
  }

  // Iniciar animaciones de página
  initPageAnimations();

  // Si hay token, buscar info del invitado primero
  if (guestToken && isConfigured()) {
    Promise.race([
      fetch(APPS_SCRIPT_URL + '?' + new URLSearchParams({
        action: 'info',
        token: guestToken
      }))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok) guestInfo = data;
        }),
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('timeout')); }, 3000);
      })
    ])
      .catch(function () { /* timeout o error — continuar sin personalización */ })
      .then(function () {
        personalizeContent();
        initIntro();
      });
  } else {
    initIntro();
  }

  // ============================
  // COUNTDOWN TIMER
  // ============================
  var WEDDING_DATE = new Date('2026-05-01T19:00:00-04:00');

  var daysEl = document.getElementById('countdown-days');
  var hoursEl = document.getElementById('countdown-hours');
  var minutesEl = document.getElementById('countdown-minutes');

  function updateCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  // ============================
  // FULLSCREEN SCREENS
  // ============================

  // Ocultar botón de confirmar si no hay token (modo preview)
  var btnConfirmar = document.getElementById('btn-confirmar');
  if (!guestToken) {
    btnConfirmar.style.display = 'none';
  }

  btnConfirmar.addEventListener('click', function () {
    var screen = document.getElementById('screen-confirmar');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  document.getElementById('btn-close-confirmar').addEventListener('click', function () {
    var screen = document.getElementById('screen-confirmar');
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });

  document.getElementById('btn-mapa').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  document.getElementById('btn-close-mapa').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa');
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.fullscreen.is-open').forEach(function (s) {
        s.classList.remove('is-open');
        s.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      });
    }
  });

  // ============================
  // FORM HANDLING
  // ============================
  var form = document.getElementById('form-confirmacion');
  var alergiaSi = document.getElementById('alergia-si');
  var alergiaNo = document.getElementById('alergia-no');
  var groupCual = document.getElementById('group-cual');
  var alergiaDetalle = document.getElementById('alergia-detalle');
  var submitBtn = form.querySelector('.btn--submit');

  function checkFormComplete(f, btn) {
    if (!f || !btn) return;
    var asistencia = f.querySelector('input[name="asistencia"]:checked');
    var alergia = f.querySelector('input[name="alergia"]:checked');
    btn.disabled = !(asistencia && alergia);
  }

  // Ocultar campo "¿Cuál?" por defecto, submit deshabilitado
  groupCual.style.display = 'none';
  if (submitBtn) submitBtn.disabled = true;

  alergiaSi.addEventListener('change', function () {
    groupCual.style.display = '';
    alergiaDetalle.disabled = false;
    checkFormComplete(form, submitBtn);
  });
  alergiaNo.addEventListener('change', function () {
    groupCual.style.display = 'none';
    alergiaDetalle.disabled = true;
    alergiaDetalle.value = '';
    checkFormComplete(form, submitBtn);
  });

  form.querySelectorAll('input[type="radio"]').forEach(function (r) {
    r.addEventListener('change', function () { checkFormComplete(form, submitBtn); });
  });

  var loadingMessages = [
    'Guardando tu lugar en nuestra mesa',
    'Preparando tu copa de bienvenida',
    'Reservando un brindis en tu honor',
    'Anotando tu nombre en nuestra historia'
  ];

  function showFormLoading(container) {
    var overlay = document.createElement('div');
    overlay.className = 'form-loading';
    overlay.innerHTML =
      '<div class="form-loading__spinner">' +
        '<div class="form-loading__ring"></div>' +
        '<div class="form-loading__monogram">N&F</div>' +
      '</div>' +
      '<div class="form-loading__message"></div>' +
      '<div class="form-loading__dots">' +
        '<span class="form-loading__dot"></span>' +
        '<span class="form-loading__dot"></span>' +
        '<span class="form-loading__dot"></span>' +
      '</div>';
    container.appendChild(overlay);

    var msgEl = overlay.querySelector('.form-loading__message');
    var idx = 0;
    msgEl.textContent = loadingMessages[idx];

    var msgInterval = setInterval(function () {
      idx = (idx + 1) % loadingMessages.length;
      msgEl.style.opacity = '0';
      setTimeout(function () {
        msgEl.textContent = loadingMessages[idx];
        msgEl.style.opacity = '1';
      }, 300);
    }, 2500);

    return { overlay: overlay, interval: msgInterval };
  }

  function hideFormLoading(loading, callback) {
    clearInterval(loading.interval);
    loading.overlay.style.opacity = '0';
    loading.overlay.style.transition = 'opacity 0.4s ease';
    setTimeout(function () {
      loading.overlay.remove();
      if (callback) callback();
    }, 400);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = new FormData(form);
    var data = {
      asistencia: formData.get('asistencia') === 'si' ? 'TRUE' : 'FALSE',
      alergia: formData.get('alergia') === 'si' ? 'TRUE' : 'FALSE',
      alergia_detalle: formData.get('alergia_detalle') || ''
    };

    var screen = document.getElementById('screen-confirmar');
    var content = screen.querySelector('.fullscreen__content');
    var loading = showFormLoading(content);

    function closeModal() {
      screen.classList.remove('is-open');
      screen.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      form.reset();
      groupCual.style.display = 'none';

      // Update guest state and UI
      if (guestInfo) {
        guestInfo.confirmacion = data.asistencia;
      }
      updateConfirmButton();
      updateFormState();
    }

    if (guestToken && isConfigured()) {
      var confirmUrl = APPS_SCRIPT_URL + '?' + new URLSearchParams({
        action: 'confirmar',
        token: guestToken,
        asistencia: data.asistencia,
        alergia: data.alergia,
        detalle: data.alergia_detalle
      }).toString();

      var minTime = new Promise(function (resolve) { setTimeout(resolve, 3000); });

      var request = fetch(confirmUrl)
        .then(function (r) { return r.json(); })
        .catch(function () {});

      Promise.all([minTime, request]).then(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showSuccessScreen(data.asistencia === 'TRUE');
        });
      });
    } else {
      setTimeout(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showSuccessScreen(data.asistencia === 'TRUE');
        });
      }, 2500);
    }
  });

  // ============================
  // TOAST NOTIFICATION
  // ============================
  function showToast(message) {
    var existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 3000);
  }

  // ============================
  // SUCCESS SCREEN
  // ============================
  function showSuccessScreen(attending) {
    var screen = document.getElementById('success-screen');
    var msgEl = document.getElementById('success-message');

    msgEl.textContent = attending
      ? '¡Nos vemos el 1 de mayo!'
      : 'Lamentamos que no puedas acompañarnos';

    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');

    if (typeof gsap === 'undefined') return;

    gsap.set('.success-screen__leaf', { opacity: 0, scale: 0.8 });
    gsap.set('.success-screen__check', { opacity: 0, scale: 0.5 });
    gsap.set('.success-screen__circle', { attr: { 'stroke-dashoffset': 157 } });
    gsap.set('.success-screen__tick', { attr: { 'stroke-dashoffset': 50 } });
    gsap.set('.success-screen__title', { opacity: 0, y: 20 });
    gsap.set('.success-screen__message', { opacity: 0, y: 15 });
    gsap.set('.success-screen__tap', { opacity: 0 });

    gsap.timeline()
      .to('.success-screen__leaf', { opacity: 0.4, scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .to('.success-screen__check', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 0.2)
      .to('.success-screen__circle', { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power2.inOut' }, 0.4)
      .to('.success-screen__tick', { attr: { 'stroke-dashoffset': 0 }, duration: 0.5, ease: 'power2.out' }, 1.0)
      .to('.success-screen__title', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.2)
      .to('.success-screen__message', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.5)
      .to('.success-screen__tap', { opacity: 1, duration: 1, ease: 'power1.inOut' }, 2.0);

    var autoClose = setTimeout(function () { closeSuccessScreen(); }, 6000);

    function onTap() {
      clearTimeout(autoClose);
      screen.removeEventListener('click', onTap);
      closeSuccessScreen();
    }

    screen.addEventListener('click', onTap);
  }

  function closeSuccessScreen() {
    var screen = document.getElementById('success-screen');
    if (!screen.classList.contains('is-open')) return;

    if (typeof gsap !== 'undefined') {
      gsap.to(screen, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: function () {
          screen.classList.remove('is-open');
          screen.setAttribute('aria-hidden', 'true');
          gsap.set(screen, { clearProps: 'opacity' });
        }
      });
    } else {
      screen.classList.remove('is-open');
      screen.setAttribute('aria-hidden', 'true');
    }
  }

  // ============================
  // LEAFLET MAP
  // ============================
  var mapInitialized = false;

  document.getElementById('btn-mapa').addEventListener('click', function () {
    if (!mapInitialized) {
      setTimeout(function () {
        var map = L.map('leaflet-map', {
          zoomControl: false
        }).setView([-34.5935606, -70.9626256], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(map);

        var customIcon = L.icon({
          iconUrl: 'assets/marcador-gps.svg',
          iconSize: [44, 46],
          iconAnchor: [22, 42],
          popupAnchor: [0, -42]
        });

        L.marker([-34.5935606, -70.9626256], { icon: customIcon })
          .addTo(map)
          .on('click', function () {
            window.open('https://www.google.com/maps/dir/?api=1&destination=-34.5935606,-70.9626256&destination_place_id=ChIJneu9TlyQZpYR6t1_TF0YCBAl&travelmode=driving', '_blank');
          });

        setTimeout(function () { map.invalidateSize(); }, 200);
        mapInitialized = true;
      }, 100);
    }
  });

})();
