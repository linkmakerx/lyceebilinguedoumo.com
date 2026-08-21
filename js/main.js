(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "dbl-lang";

  /* ---------------------------------------------------------------------
     1. Language toggle (FR / EN)
  --------------------------------------------------------------------- */
  function applyLang(lang) {
    root.setAttribute("data-lang", lang);
    root.lang = lang;

    document.querySelectorAll("[data-fr][data-en]").forEach(function (el) {
      var text = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-fr");
      if (text !== null) el.textContent = text;
    });

    document.querySelectorAll("[data-fr-ph][data-en-ph]").forEach(function (el) {
      var ph = lang === "en" ? el.getAttribute("data-en-ph") : el.getAttribute("data-fr-ph");
      if (ph !== null) el.setAttribute("placeholder", ph);
    });

    document.querySelectorAll(".lang-opt").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-val") === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  var langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-lang") || "fr";
      applyLang(current === "fr" ? "en" : "fr");
    });
  }

  var savedLang = null;
  try { savedLang = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (savedLang === "en" || savedLang === "fr") applyLang(savedLang);

  /* ---------------------------------------------------------------------
     2. Header state on scroll + active nav link
  --------------------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  var toTopBtn = document.getElementById("toTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (toTopBtn) toTopBtn.classList.toggle("show", y > 700);

    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top - 140 <= 0) current = sec;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTopBtn) {
    toTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     3. Mobile menu
  --------------------------------------------------------------------- */
  var hamburger = document.getElementById("hamburger");
  var mainNav = document.getElementById("mainNav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.forEach(function (a) {
      a.addEventListener("click", function () {
        mainNav.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     4. Scroll reveal
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------------------------------------------------------------
     5. Animated stat counters
  --------------------------------------------------------------------- */
  var statNums = document.querySelectorAll(".stat-num");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && statNums.length) {
    var statIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statNums.forEach(function (el) { statIO.observe(el); });
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------------------------------------------------------------------
     6. Academic offer tabs
  --------------------------------------------------------------------- */
  var tabBtns = document.querySelectorAll(".tab-btn");
  var tabPanels = document.querySelectorAll(".tab-panel");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-target");
      tabBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      tabPanels.forEach(function (p) { p.classList.toggle("active", p.id === target); });
    });
  });

  /* ---------------------------------------------------------------------
     7. Gallery lightbox
  --------------------------------------------------------------------- */
  var masonItems = Array.prototype.slice.call(document.querySelectorAll(".mason-item"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = (index + masonItems.length) % masonItems.length;
    var src = masonItems[currentIndex].getAttribute("data-full");
    lbImg.setAttribute("src", src);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  masonItems.forEach(function (item, index) {
    item.addEventListener("click", function () { openLightbox(index); });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { openLightbox(currentIndex - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { openLightbox(currentIndex + 1); });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") openLightbox(currentIndex + 1);
  });

  /* ---------------------------------------------------------------------
     8. Contact form (client-side demo only)
  --------------------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var lang = root.getAttribute("data-lang") || "fr";
      contactForm.classList.add("sent");
      if (formNote) {
        formNote.textContent =
          lang === "en"
            ? "Thanks! This demo form doesn't send yet — email the school directly once contact details are published."
            : "Merci ! Ce formulaire de démonstration n'envoie rien pour l'instant — écrivez directement à l'établissement dès la publication des coordonnées.";
      }
      contactForm.reset();
    });
  }

  /* ---------------------------------------------------------------------
     9. Footer year
  --------------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
