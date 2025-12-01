// ============================
// NAV / MENU HAMBURGUESA
// ============================

const btn = document.getElementById('menu-btn');
const overlay = document.getElementById('overlay');
const menu = document.getElementById('mobile-menu');
const counters = document.querySelectorAll('.counter');
let scrollStarted = false;

if (btn) {
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    overlay.classList.toggle('overlay-show');
    document.body.classList.toggle('stop-scrolling');
    menu.classList.toggle('show-menu');

    // Accesibilidad
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

if (overlay) {
  overlay.addEventListener('click', () => {
    btn?.classList.remove('open');
    overlay.classList.remove('overlay-show');
    document.body.classList.remove('stop-scrolling');
    menu?.classList.remove('show-menu');
    btn?.setAttribute('aria-expanded', 'false');
  });
}

document.addEventListener('scroll', scrollPage);

function scrollPage() {
  const scrollPos = window.scrollY;

  if (scrollPos > 100 && !scrollStarted) {
    countUp();
    scrollStarted = true;
  } else if (scrollPos < 100 && scrollStarted) {
    resetCounters();
    scrollStarted = false;
  }
}

function countUp() {
  counters.forEach((counter) => {
    counter.innerText = '0';

    const updateCounter = () => {
      const target = +counter.getAttribute('data-target');
      const c = +counter.innerText;
      const increment = target / 100;

      if (c < target) {
        counter.innerText = `${Math.ceil(c + increment)}`;
        setTimeout(updateCounter, 75);
      } else {
        counter.innerText = target;
      }
    };

    updateCounter();
  });
}

function resetCounters() {
  counters.forEach((counter) => (counter.innerHTML = '0'));
}

// ============================
// VIDEOS DE FONDO (TODOS)
// ============================

const bgVideos = document.querySelectorAll('.bg-video');

bgVideos.forEach((vid) => {
  if (!vid) return;
  vid.muted = true;

  vid.addEventListener('loadeddata', () => {
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log(
          'Autoplay bloqueado hasta interacción del usuario en algún video de fondo.'
        );
      });
    }
  });
});

// ============================
// EFECTO: LOOP SUAVE VIDEO PORTADA (SECTION A)
// ============================

const heroVideo = document.querySelector('.section-a .bg-video');

if (heroVideo) {
  let restarting = false;

  heroVideo.addEventListener('timeupdate', () => {
    if (!heroVideo.duration) return;

    const remaining = heroVideo.duration - heroVideo.currentTime;

    if (!restarting && remaining <= 0.3) {
      restarting = true;

      heroVideo.style.opacity = '0';

      setTimeout(() => {
        heroVideo.currentTime = 0.01;

        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log('No se pudo reproducir el video al reiniciar (portada).');
          });
        }

        heroVideo.style.opacity = '1';
        restarting = false;
      }, 400);
    }
  });
}

// ============================
// SECTION B – ANIMACIÓN TIPO SPLINE (MOUSE PARALLAX)
// ============================

(function () {
  const sectionB = document.querySelector('.section-b');
  if (!sectionB) return;

  const root = document.documentElement;

  const handleMove = (e) => {
    const rect = sectionB.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / centerX; // -1 a 1
    const normY = (y - centerY) / centerY; // -1 a 1

    root.style.setProperty('--mouse-x', normX.toString());
    root.style.setProperty('--mouse-y', normY.toString());
  };

  const handleLeave = () => {
    root.style.setProperty('--mouse-x', '0');
    root.style.setProperty('--mouse-y', '0');
  };

  // Desktop: parallax con mouse
  sectionB.addEventListener('mousemove', handleMove);
  sectionB.addEventListener('mouseleave', handleLeave);

  // Mobile / iPhone: auto-parallax muy suave
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    let t = 0;
    const autoParallax = () => {
      t += 0.01;
      const nx = Math.sin(t) * 0.15;
      const ny = Math.cos(t * 0.8) * 0.1;
      root.style.setProperty('--mouse-x', nx.toString());
      root.style.setProperty('--mouse-y', ny.toString());
      requestAnimationFrame(autoParallax);
    };
    autoParallax();
  }
})();

// ==========================================
// CARRUSEL DE MARCAS — ORDEN + FLECHAS + SWIPE + AUTOPLAY
// ==========================================
(function () {
  const slider = document.getElementById('logosSlider');
  if (!slider) return;

  const track = slider.querySelector('.logos-track');
  const items = track ? Array.from(track.querySelectorAll('.logo-item')) : [];
  const prevBtn = document.querySelector('.logos-nav.prev');
  const nextBtn = document.querySelector('.logos-nav.next');

  if (!track || items.length === 0) return;

  let currentIndex = 0;
  let itemStep = 0; // distancia en px entre un logo y el siguiente
  let autoPlayId = null;
  let isHover = false;

  // Para swipe en móviles / iPhone
  let touchStartX = 0;
  let touchEndX = 0;

  // Calcula la distancia entre el logo 0 y 1
  const computeStep = () => {
    if (items.length < 2) {
      itemStep = items[0]?.offsetWidth || 180;
      return;
    }

    const prevTransform = track.style.transform;
    track.style.transform = 'translateX(0px)';

    const rect0 = items[0].getBoundingClientRect();
    const rect1 = items[1].getBoundingClientRect();
    itemStep = rect1.left - rect0.left;

    // fallback si por alguna razón sale 0 o negativo
    if (!itemStep || itemStep <= 0) {
      itemStep = items[0].offsetWidth + 40; // 40px ~ gap por defecto
    }

    track.style.transform = prevTransform;
  };

  const goToIndex = (index) => {
    const total = items.length;
    if (total === 0 || itemStep === 0) return;

    // Loop lógico: después del último vuelve al primero
    currentIndex = (index + total) % total;

    const offset = -currentIndex * itemStep;
    track.style.transform = `translateX(${offset}px)`;
  };

  const next = () => {
    goToIndex(currentIndex + 1);
  };

  const prev = () => {
    goToIndex(currentIndex - 1);
  };

  const startAutoplay = () => {
    if (autoPlayId) return;
    autoPlayId = setInterval(() => {
      if (!isHover) {
        next();
      }
    }, 2600); // tiempo entre movimientos
  };

  const stopAutoplay = () => {
    if (!autoPlayId) return;
    clearInterval(autoPlayId);
    autoPlayId = null;
  };

  // Hover → pausa (solo desktop)
  slider.addEventListener('mouseenter', () => {
    isHover = true;
  });

  slider.addEventListener('mouseleave', () => {
    isHover = false;
  });

  // Click en flechas
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
    });
  }

  // Swipe en móviles / iPhone
  slider.addEventListener(
    'touchstart',
    (e) => {
      if (!e.touches || !e.touches.length) return;
      touchStartX = e.touches[0].clientX;
      touchEndX = touchStartX;
    },
    { passive: true }
  );

  slider.addEventListener(
    'touchmove',
    (e) => {
      if (!e.touches || !e.touches.length) return;
      touchEndX = e.touches[0].clientX;
    },
    { passive: true }
  );

  slider.addEventListener(
    'touchend',
    () => {
      const deltaX = touchEndX - touchStartX;
      const threshold = 50; // mínimo movimiento para considerar swipe

      if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0) {
          // swipe izquierda → siguiente
          next();
        } else {
          // swipe derecha → anterior
          prev();
        }
      }
    },
    { passive: true }
  );

  // Recalcular al redimensionar
  window.addEventListener('resize', () => {
    computeStep();
    goToIndex(currentIndex);
  });

  // Inicializar carrusel
  window.addEventListener('load', () => {
    computeStep();
    goToIndex(0);
    startAutoplay();
  });
})();

// ==========================================
// FORMULARIO DE CONTACTO (FORMSPREE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('form-alert');

  if (!form || !alertBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    alertBox.className = 'form-alert';
    alertBox.textContent = '';

    const submitBtn = form.querySelector('button[type="submit"]');
    const spanText = submitBtn?.querySelector('span');
    const originalText = spanText ? spanText.textContent : submitBtn.textContent;

    submitBtn.disabled = true;
    if (spanText) spanText.textContent = 'Enviando...';
    else submitBtn.textContent = 'Enviando...';

    try {
      const formData = new FormData(form);

      const response = await fetch('https://formspree.io/f/mvgjrdpn', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        form.reset();
        alertBox.textContent =
          '✅ Gracias, hemos recibido su mensaje. El equipo de MAKINTEC se estará comunicando con usted pronto.';
        alertBox.classList.add('form-alert--success', 'form-alert--show');
      } else {
        throw new Error('Error al enviar el formulario');
      }
    } catch (error) {
      console.error(error);
      alertBox.textContent =
        '⚠️ Ocurrió un problema al enviar su mensaje. Por favor, inténtelo de nuevo o contáctenos por WhatsApp.';
      alertBox.classList.add('form-alert--error', 'form-alert--show');
    } finally {
      submitBtn.disabled = false;
      if (spanText) spanText.textContent = originalText;
      else submitBtn.textContent = originalText;
    }

    setTimeout(() => {
      alertBox.classList.remove('form-alert--show');
    }, 6000);
  });
});
