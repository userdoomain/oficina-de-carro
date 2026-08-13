/* ==========================================================================
   Garagem Prime — main.js
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Image fallback (nunca quebrar a página) ---------- */
  var PLACEHOLDER =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>" +
      "<rect width='800' height='600' fill='#1a2030'/>" +
      "<rect x='0' y='0' width='800' height='600' fill='url(#g)'/>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='#232b3d'/><stop offset='1' stop-color='#12161f'/></linearGradient></defs>" +
      "<g stroke='#ff6a13' stroke-width='14' stroke-linecap='round' stroke-linejoin='round' fill='none'>" +
      "<path d='M300 420l90-90M330 240a50 50 0 1 1 71 71l-21 21 90 90-50 50-90-90-21 21a50 50 0 1 1-71-71l-60-60 50-50z'/>" +
      "</g>" +
      "<text x='400' y='540' text-anchor='middle' font-family='Rajdhani, sans-serif' font-size='34' fill='#8b94a6'>FOTO DA GARAGEM PRIME</text>" +
      "</svg>"
    );

  function applyPlaceholder(img) {
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = "1";
    img.src = PLACEHOLDER;
  }

  function guardImage(img) {
    img.addEventListener("error", function () { applyPlaceholder(img); });
    if (img.complete && img.naturalWidth === 0) applyPlaceholder(img);
    setTimeout(function () {
      if (!img.complete || img.naturalWidth === 0) applyPlaceholder(img);
    }, 6000);
  }

  $$("img").forEach(guardImage);

  /* ---------- Galeria / lightbox ---------- */
  var galleryItems = $$(".gallery-item");
  var lightbox = $("#lightbox");
  var lightboxImg = $("#lightboxImg");
  var lightboxTitle = $("#lightboxTitle");
  var lightboxCaption = $("#lightboxCaption");
  var lightboxClose = $(".lightbox-close", lightbox);
  var lightboxPrev = $(".lightbox-prev", lightbox);
  var lightboxNext = $(".lightbox-next", lightbox);
  var lightboxOpen = false;
  var galleryCurrent = 0;
  var lastFocused = null;

  function openLightbox(index) {
    if (!lightbox || !galleryItems.length) return;
    galleryCurrent = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[galleryCurrent];
    var imgEl = item.querySelector("img");
    lightboxImg.src = imgEl ? (imgEl.currentSrc || imgEl.src) : "";
    lightboxImg.alt = imgEl ? (imgEl.alt || "") : "";
    lightboxTitle.textContent = item.dataset.title || "";
    lightboxCaption.textContent = item.dataset.caption || "";
    guardImage(lightboxImg);
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    (lightboxClose || lightbox).focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  galleryItems.forEach(function (item, i) {
    item.addEventListener("click", function () { openLightbox(i); });
  });

  if (lightbox) {
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxNext.addEventListener("click", function () { openLightbox(galleryCurrent + 1); });
    lightboxPrev.addEventListener("click", function () { openLightbox(galleryCurrent - 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (lightbox && !lightbox.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
      if (e.key === "ArrowRight") { e.preventDefault(); openLightbox(galleryCurrent + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); openLightbox(galleryCurrent - 1); }
    }
  });

  /* ---------- Header: scroll state ---------- */
  var header = $("#header");
  var backToTop = $("#backToTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("scrolled", y > 10);
    backToTop.classList.toggle("visible", y > 600);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var navToggle = $("#navToggle");
  var navLinks = $("#navLinks");

  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
  }

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });

  $$("#navLinks a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scrollspy ---------- */
  var sections = $$("main section[id]");

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            $$(".nav-link").forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$(".reveal");

  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = $$(".stat-value");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    if (reducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && !reducedMotion) {
    var counterObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { counterObs.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (parseInt(el.getAttribute("data-count"), 10) || 0) + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- Testimonials slider ---------- */
  var track = $("#testimonialTrack");
  var slides = $$(".testimonial", track);
  var dots = $$(".testimonial-dot");
  var current = 0;
  var timer = null;
  var INTERVAL = 6000;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    dots.forEach(function (dot, i) {
      dot.setAttribute("aria-selected", i === current ? "true" : "false");
    });
  }

  function nextSlide() { goTo(current + 1); }

  function startAuto() {
    if (slides.length < 2 || reducedMotion) return;
    stopAuto();
    timer = setInterval(nextSlide, INTERVAL);
  }

  function stopAuto() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goTo(i);
      startAuto();
    });
    dot.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { goTo(current + 1); startAuto(); }
      if (e.key === "ArrowLeft") { goTo(current - 1); startAuto(); }
    });
    dot.setAttribute("tabindex", "0");
  });

  var testimonials = $(".testimonials");
  testimonials.addEventListener("mouseenter", stopAuto);
  testimonials.addEventListener("mouseleave", startAuto);
  testimonials.addEventListener("touchstart", stopAuto, { passive: true });
  testimonials.addEventListener("touchend", startAuto, { passive: true });

  if (track) {
    slides.forEach(function (slide) { slide.style.minWidth = "100%"; });
    track.style.display = "flex";
    track.style.transition = "transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)";
    goTo(0);
    startAuto();
  }

  /* ---------- FAQ: open only one at a time ---------- */
  $$(".faq-item").forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        $$(".faq-item").forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = $("#contactForm");

  var validators = {
    nome: function (v) { return v.trim().length >= 3 ? "" : "Informe seu nome completo (mín. 3 caracteres)."; },
    telefone: function (v) {
      var digits = v.replace(/\D/g, "");
      return digits.length >= 10 ? "" : "Informe um telefone válido com DDD.";
    },
    email: function (v) {
      if (!v.trim()) return "";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "E-mail inválido.";
    },
    veiculo: function (v) {
      var t = v.trim();
      if (!t) return "";
      return t.length >= 3 ? "" : "Informe o modelo do veículo (mínimo 3 caracteres).";
    },
    servico: function (v) { return v ? "" : "Selecione um serviço."; }
  };

  function validateField(name, value) {
    var check = validators[name];
    return check ? check(value) : "";
  }

  function setError(name, message) {
    var group = document.getElementById("group-" + name);
    var errEl = $("#err-" + name);
    if (!group || !errEl) return;
    group.classList.toggle("invalid", Boolean(message));
    errEl.textContent = message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var firstInvalid = null;
    ["nome", "telefone", "email", "veiculo", "servico", "mensagem", "data", "periodo"].forEach(function (name) {
      var input = form.elements[name];
      var message = validateField(name, input.value);
      setError(name, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      showToast("Ops! Confira os campos destacados e tente novamente.", false);
      return;
    }

    var data = new FormData(form);
    var summary =
      "Nome: " + data.get("nome") + "\n" +
      "Telefone: " + data.get("telefone") + "\n" +
      "E-mail: " + (data.get("email") || "—") + "\n" +
      "Veículo: " + (data.get("veiculo") || "—") + "\n" +
      "Serviço: " + data.get("servico") + "\n" +
      "Data preferida: " + (data.get("data") || "flexível") + "\n" +
      "Período: " + (data.get("periodo") || "flexível") + "\n" +
      "Mensagem: " + (data.get("mensagem") || "—");

    console.log("[Garagem Prime] Nova solicitação de agendamento:\n" + summary);

    form.reset();
    ["nome", "telefone", "email", "veiculo", "servico", "mensagem", "data", "periodo"].forEach(function (name) {
      setError(name, "");
    });
    showToast("Solicitação enviada! Nossa equipe retornará em até 1 hora útil.", true);
  });

  ["nome", "telefone", "email", "veiculo", "servico", "mensagem", "data", "periodo"].forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener("input", function () {
      if ($("#err-" + name).textContent) setError(name, validateField(name, input.value));
    });
    input.addEventListener("change", function () {
      if ($("#err-" + name).textContent) setError(name, validateField(name, input.value));
    });
  });

  /* ---------- Toast ---------- */
  var toast = $("#toast");
  var toastTimer = null;

  function showToast(message, success) {
    toast.textContent = message;
    toast.style.borderColor = success ? "rgba(34, 197, 94, 0.5)" : "#f87171";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 4500);
  }

  /* ---------- Back to top ---------- */
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();