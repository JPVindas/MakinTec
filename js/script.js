// ============================
// NAV / MENU HAMBURGUESA
// ============================

const btn = document.getElementById('menu-btn');
const overlay = document.getElementById('overlay');
const menu = document.getElementById('mobile-menu');
const counters = document.querySelectorAll('.counter');
let scrollStarted = false;

if (btn) {
  btn.addEventListener('click', navToggle);
}
document.addEventListener('scroll', scrollPage);

function navToggle() {
  btn.classList.toggle('open');
  overlay.classList.toggle('overlay-show');
  document.body.classList.toggle('stop-scrolling');
  menu.classList.toggle('show-menu');
}

function scrollPage() {
  const scrollPos = window.scrollY;

  if (scrollPos > 100 && !scrollStarted) {
    countUp();
    scrollStarted = true;
  } else if (scrollPos < 100 && scrollStarted) {
    reset();
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

function reset() {
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
// SECTION B – ANIMACIÓN INTERACTIVA TIPO SPLINE
// ============================
const servicesSection = document.querySelector('.section-b');
const servicesAnimLayer = document.querySelector('.services-anim-layer');
const servicesOrbits = document.querySelectorAll('.services-orbit');
const servicesLines = document.querySelectorAll('.services-line');
const servicesDots = document.querySelectorAll('.services-dots span');
const serviceCards = document.querySelectorAll('.service-card');

if (servicesSection) {
  const handleMouseMove = (e) => {
    const rect = servicesSection.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;

    const moveX = relX * 24;
    const moveY = relY * 18;

    if (servicesAnimLayer) {
      servicesAnimLayer.style.transform = `translate3d(${moveX * 0.6}px, ${
        moveY * 0.6
      }px, 0)`;
    }

    servicesOrbits.forEach((orbit, index) => {
      const depth = index === 0 ? 1.0 : 1.4;
      orbit.style.transform = `translate3d(${moveX * depth}px, ${
        moveY * depth
      }px, 0)`;
    });

    servicesLines.forEach((line, index) => {
      const depth = 0.5 + index * 0.25;
      line.style.transform = `translate3d(${moveX * depth}px, ${
        moveY * depth
      }px, 0)`;
    });

    servicesDots.forEach((dot, index) => {
      const depth = 1 + index * 0.3;
      dot.style.transform = `translate3d(${moveX * depth}px, ${
        moveY * depth
      }px, 0)`;
    });
  };

  servicesSection.addEventListener('mousemove', handleMouseMove);

  servicesSection.addEventListener('mouseenter', () => {
    servicesSection.classList.add('services--hover');
  });

  servicesSection.addEventListener('mouseleave', () => {
    servicesSection.classList.remove('services--hover');

    if (servicesAnimLayer) {
      servicesAnimLayer.style.transform = 'translate3d(0,0,0)';
    }
    servicesOrbits.forEach((orbit) => {
      orbit.style.transform = 'translate3d(0,0,0)';
    });
    servicesLines.forEach((line) => {
      line.style.transform = 'translate3d(0,0,0)';
    });
    servicesDots.forEach((dot) => {
      dot.style.transform = 'translate3d(0,0,0)';
    });
  });

  serviceCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('service-card--active');
      servicesOrbits.forEach((orbit) =>
        orbit.classList.add('services-orbit--pulse')
      );
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('service-card--active');
      servicesOrbits.forEach((orbit) =>
        orbit.classList.remove('services-orbit--pulse')
      );
    });
  });
}


// ==========================================
// CARRUSEL DE MARCAS — LOOP INFINITO REAL
// ==========================================

const slider = document.getElementById('logosSlider');
const track = slider?.querySelector('.logos-track');
const prevBtn = document.querySelector('.logos-nav.prev');
const nextBtn = document.querySelector('.logos-nav.next');

if (slider && track) {
  // 1) CLONAR LOS LOGOS PARA EL LOOP
  const logos = Array.from(track.children);
  logos.forEach((logo) => {
    const clone = logo.cloneNode(true);
    track.appendChild(clone);
  });

  // 2) VARIABLES
  let position = 0;
  const STEP = 180;
  const TRACK_WIDTH = track.scrollWidth / 2; // mitad = set original

  // 3) FUNCIÓN PARA MOVER CON LOOP
  function move(direction) {
    position += direction * STEP;

    // Cuando pase el final → regresar
    if (position <= -TRACK_WIDTH) {
      position = 0;
      track.style.transition = 'none';
      track.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.style.transition = 'transform 0.35s ease-out';
          position += direction * STEP;
          track.style.transform = `translateX(${position}px)`;
        });
      });
      return;
    }

    // Cuando pase el inicio hacia atrás → saltar al final
    if (position >= 0) {
      position = -TRACK_WIDTH;
    }

    track.style.transition = 'transform 0.35s ease-out';
    track.style.transform = `translateX(${position}px)`;
  }

  // Botones
  if (prevBtn) prevBtn.addEventListener('click', () => move(1));
  if (nextBtn) nextBtn.addEventListener('click', () => move(-1));
}

// ============================
// FORMULARIO DE CONTACTO
// ============================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('form-alert');

  if (!form || !alertBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // ❌ no recargar ni cambiar de página

    // limpiar estado previo de la alerta
    alertBox.className = 'form-alert';
    alertBox.textContent = '';

    const submitBtn = form.querySelector('button[type="submit"]');
    const spanText = submitBtn?.querySelector('span');
    const originalText = spanText ? spanText.textContent : submitBtn.textContent;

    // estado "enviando..."
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
      // devolver botón a estado normal
      submitBtn.disabled = false;
      if (spanText) spanText.textContent = originalText;
      else submitBtn.textContent = originalText;
    }

    // ocultar alerta después de unos segundos
    setTimeout(() => {
      alertBox.classList.remove('form-alert--show');
    }, 6000);
  });
});
