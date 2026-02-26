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
  // INTRO ANIMATION (GSAP)
  // ============================
  function initIntro() {
    var intro = document.getElementById('intro');
    var introText = document.getElementById('intro-text');
    var introSeal = document.getElementById('intro-seal');

    // Asegurar visibilidad (pudo estar oculto durante fetch)
    if (introText) introText.style.opacity = '';

    if (intro && introText && introSeal && typeof gsap !== 'undefined') {

      // 1. Split text into word spans
      (function () {
        var html = introText.innerHTML;
        var parts = html.split(/(<br\s*\/?>)/);
        introText.innerHTML = '';
        parts.forEach(function (part) {
          if (part.match(/<br\s*\/?>/)) {
            introText.appendChild(document.createElement('br'));
            return;
          }
          var words = part.trim().split(/\s+/);
          words.forEach(function (word, i) {
            if (!word) return;
            var span = document.createElement('span');
            span.className = 'intro__word';
            span.textContent = word;
            introText.appendChild(span);
            if (i < words.length - 1) introText.appendChild(document.createTextNode(' '));
          });
        });
      })();

      // 2. Ambient golden dust (CSS animated)
      for (var d = 0; d < 30; d++) {
        var dust = document.createElement('div');
        dust.className = 'intro__dust';
        dust.style.left = Math.random() * 100 + '%';
        dust.style.animationDelay = Math.random() * 8 + 's';
        dust.style.animationDuration = 5 + Math.random() * 7 + 's';
        intro.appendChild(dust);
      }

      // 3. GSAP — Entrance timeline
      var entranceTl = gsap.timeline({ delay: 0.4 });

      entranceTl
        .from('.intro__word', {
          y: 30,
          opacity: 0,
          stagger: 0.18,
          duration: 0.8,
          ease: 'power3.out'
        })
        .from('.intro__seal-wrapper', {
          y: 60,
          opacity: 0,
          scale: 0.5,
          duration: 1.2,
          ease: 'back.out(1.7)'
        }, '-=0.3')
        .to('.intro__tap', {
          opacity: 0.5,
          duration: 0.8,
          ease: 'power1.out'
        }, '+=0.4');

      // 4. Continuous loops
      gsap.to('.intro__word', {
        backgroundPosition: '300% center',
        duration: 4,
        ease: 'none',
        repeat: -1,
        delay: 2
      });

      gsap.to('.intro__seal', {
        scale: 1.04,
        duration: 2.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 3
      });

      gsap.to('.intro__tap', {
        opacity: 0.9,
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 4
      });

      // 5. Click to break the seal
      var opened = false;
      introSeal.addEventListener('click', function () {
        if (opened) return;
        opened = true;

        gsap.killTweensOf('.intro__seal');
        gsap.killTweensOf('.intro__tap');
        gsap.killTweensOf('.intro__word');

        var openTl = gsap.timeline();

        openTl
          .to('.intro__seal', {
            scale: 1.08,
            duration: 0.1,
            ease: 'power2.in',
            yoyo: true,
            repeat: 5
          })
          .to('.intro__seal', {
            scale: 3,
            rotation: 45,
            opacity: 0,
            duration: 0.6,
            ease: 'power4.out'
          })
          .to('.intro__shockwave', {
            width: '200vmax',
            height: '200vmax',
            opacity: 0.7,
            borderWidth: 1,
            duration: 1.2,
            ease: 'power2.out'
          }, '-=0.5')
          .to('.intro__shockwave', {
            opacity: 0,
            duration: 0.4
          }, '-=0.4')
          .to('.intro__shockwave--2', {
            width: '200vmax',
            height: '200vmax',
            opacity: 0.5,
            borderWidth: 1.5,
            duration: 1.5,
            ease: 'power2.out'
          }, '-=1.3')
          .to('.intro__shockwave--2', {
            opacity: 0,
            duration: 0.5
          }, '-=0.5')
          .to('.intro__text', {
            y: -50,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.in'
          }, '-=1.8')
          .to('.intro__tap', {
            opacity: 0,
            duration: 0.3
          }, '<')
          .to('.intro__rays', {
            opacity: 1,
            rotation: 20,
            scale: 1.5,
            duration: 2,
            ease: 'power1.out'
          }, '-=1.5')
          .to('.intro__seal-wrapper', {
            scale: 1.5,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.in'
          }, '-=1')
          .to('.intro__flash', {
            opacity: 1,
            scale: 5,
            duration: 1.5,
            ease: 'power2.in'
          }, '-=0.8')
          .to(intro, {
            opacity: 0,
            duration: 1,
            ease: 'power1.inOut',
            onComplete: function () {
              intro.remove();
            }
          }, '-=0.4');
      });
    }
  }

  // ============================
  // PERSONALIZACIÓN & ARRANQUE
  // ============================
  function personalizeContent() {
    if (!guestInfo) return;

    // Personalizar texto del intro
    var introTextEl = document.getElementById('intro-text');
    if (introTextEl && guestInfo.invitado) {
      var firstName = guestInfo.invitado.split(' ')[0];
      var companion = guestInfo.acompanante || '';

      if (companion && companion.toLowerCase() !== 'pareja' && companion.trim() !== '') {
        var companionFirst = companion.split(' ')[0];
        introTextEl.innerHTML = 'Esta es una invitación<br>exclusiva para ' + firstName + ' y ' + companionFirst;
      } else {
        introTextEl.innerHTML = 'Esta es una invitación<br>exclusiva para ti, ' + firstName;
      }
    }

    // Personalizar título del formulario
    var titleEl = document.querySelector('#screen-confirmar .fullscreen__title');
    if (titleEl && guestInfo.invitado) {
      titleEl.innerHTML = guestInfo.invitado.split(' ')[0] + ',<br>confirma tu<br>asistencia';
    }

    // Si ya confirmó, mostrar estado en vez del formulario
    if (guestInfo.confirmacion === 'TRUE' || guestInfo.confirmacion === 'FALSE') {
      var formEl = document.getElementById('form-confirmacion');
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

  // Iniciar: si hay token, buscar info del invitado primero
  if (guestToken && isConfigured()) {
    // Ocultar texto del intro mientras cargamos datos
    var introTextEl = document.getElementById('intro-text');
    if (introTextEl) introTextEl.style.opacity = '0';

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

      var request = new Promise(function (resolve) {
        var img = new Image();
        img.onload = img.onerror = function () { resolve(); };
        img.src = confirmUrl;
      });

      Promise.all([minTime, request]).then(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showToast('¡Gracias por confirmar!');
        });
      });
    } else {
      setTimeout(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showToast('¡Gracias por confirmar!');
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
  // SCROLL ANIMATIONS
  // ============================
  var fadeTargets = document.querySelectorAll(
    '.countdown, .message, .fecha, .fiesta__card, .fiesta__title'
  );

  fadeTargets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

  fadeTargets.forEach(function (el) {
    observer.observe(el);
  });

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
