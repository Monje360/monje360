/* =========================================================
   MONJE360 — Motion engine
   Lenis smooth scroll + GSAP/ScrollTrigger reveals
   + custom cursor + magnetic buttons + marquee + intro
   ========================================================= */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis = null;
  function initLenis() {
    if (prefersReducedMotion || !window.Lenis) return;
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.1,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
    }

    // Anchor links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  /* ---------------- Custom cursor ---------------- */
  function initCursor() {
    if (isCoarsePointer || prefersReducedMotion) return;
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    document.body.appendChild(cursor);

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;
    const speed = 0.18;
    function loop() {
      tx += (x - tx) * speed;
      ty += (y - ty) * speed;
      cursor.style.transform = `translate3d(${tx - cursor.offsetWidth / 2}px, ${ty - cursor.offsetHeight / 2}px, 0)`;
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });

    // Hover states
    const hoverTargets = "a, button, .btn, [data-cursor='hover']";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest && e.target.closest(hoverTargets)) cursor.classList.add("is-hover");
      if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) cursor.classList.add("is-text");
    });
    document.addEventListener("mouseout", () => {
      cursor.classList.remove("is-hover");
      cursor.classList.remove("is-text");
    });
  }

  /* ---------------- Mouse parallax (Apple-like soft) ---------------- */
  function initParallax() {
    if (isCoarsePointer || prefersReducedMotion) return;
    const els = document.querySelectorAll("[data-parallax]");
    if (!els.length) return;
    const state = [];
    els.forEach((el) => {
      const strength = parseFloat(el.dataset.parallax) || 0.05;
      state.push({ el, strength, x: 0, y: 0, tx: 0, ty: 0 });
    });
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    function loop() {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      state.forEach((s) => {
        s.tx = (mx - cx) * s.strength;
        s.ty = (my - cy) * s.strength;
        s.x += (s.tx - s.x) * 0.08;
        s.y += (s.ty - s.y) * 0.08;
        s.el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    if (isCoarsePointer || prefersReducedMotion) return;
    const els = document.querySelectorAll("[data-magnetic]");
    els.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.18}px, ${relY * 0.18}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------- Nav scroll state + mobile toggle ---------------- */
  function initNav() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("is-open");
        menu.classList.toggle("is-open");
        document.body.style.overflow = menu.classList.contains("is-open") ? "hidden" : "";
      });
      menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          toggle.classList.remove("is-open");
          menu.classList.remove("is-open");
          document.body.style.overflow = "";
        })
      );
    }
  }

  /* ---------------- Reveal animations (IntersectionObserver fallback) ---------------- */
  function initRevealsFallback() {
    const revealEls = document.querySelectorAll(".reveal, .reveal-line");
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || 0, 10);
            setTimeout(() => el.classList.add("is-visible"), delay);
            io.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------- GSAP advanced motion ---------------- */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Split words: take elements with [data-split-words] and wrap each word
    document.querySelectorAll("[data-split-words]").forEach((el) => {
      const text = el.textContent.trim();
      const html = text
        .split(/\s+/)
        .map((w) => `<span class="word-wrap" style="overflow:hidden;display:inline-block;"><span class="word" style="display:inline-block;will-change:transform;">${w}</span></span>`)
        .join(" ");
      el.innerHTML = html;
    });

    // Hero word reveal
    gsap.utils.toArray("[data-hero-words] .word").forEach((w, i) => {
      gsap.from(w, {
        yPercent: 110,
        duration: 1,
        ease: "expo.out",
        delay: 0.6 + i * 0.04,
      });
    });

    // Generic word reveal on scroll
    gsap.utils.toArray("[data-scroll-words]").forEach((container) => {
      const words = container.querySelectorAll(".word");
      gsap.from(words, {
        yPercent: 110,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.04,
        scrollTrigger: { trigger: container, start: "top 80%" },
      });
    });

    // Scroll-velocity scaling on marquee tracks
    gsap.utils.toArray(".marquee").forEach((m) => {
      const track = m.querySelector(".marquee__track");
      if (!track) return;
      let speed = 0;
      ScrollTrigger.create({
        trigger: m,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          speed = self.getVelocity() / 1000;
          gsap.to(m, { skewX: gsap.utils.clamp(-6, 6, speed), duration: 0.4, ease: "power3.out", overwrite: true });
        },
      });
    });

    // Fade-in stats counters
    gsap.utils.toArray(".stat__num[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const obj = { val: 0 };
      gsap.to(obj, {
        val: end,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
        onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString("es-ES") + suffix; },
      });
    });

    // Service stack: when each card pins, scale-down the previous
    gsap.utils.toArray(".service").forEach((card, i, arr) => {
      gsap.to(card, {
        scale: 1 - (arr.length - i) * 0.03,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top top+=" + (12 + i * 2) + "vh",
          endTrigger: ".services",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // Parallax case art
    gsap.utils.toArray(".case").forEach((c) => {
      const art = c.querySelector(".case__art");
      if (!art) return;
      gsap.to(art, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // Footer hero text marquee
    gsap.utils.toArray("[data-footer-hero]").forEach((el) => {
      gsap.to(el, {
        xPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // Page header title reveal (inner pages)
    gsap.utils.toArray("[data-page-title]").forEach((el) => {
      gsap.from(el, { yPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out", delay: 0.4 });
    });

    ScrollTrigger.refresh();
  }

  /* ---------------- Intro overlay ---------------- */
  function initIntro() {
    const overlay = document.querySelector(".overlay");
    if (!overlay) return;
    if (prefersReducedMotion) { overlay.remove(); return; }
    const count = overlay.querySelector(".overlay__count");
    let n = 0;
    const interval = setInterval(() => {
      n = Math.min(100, n + Math.floor(Math.random() * 18 + 6));
      if (count) count.textContent = String(n).padStart(3, "0");
      if (n >= 100) {
        clearInterval(interval);
        if (window.gsap) {
          window.gsap.to(overlay, { yPercent: -100, duration: 1.1, ease: "expo.inOut", delay: 0.2, onComplete: () => overlay.remove() });
        } else {
          overlay.style.transition = "transform .9s cubic-bezier(.83,0,.17,1)";
          overlay.style.transform = "translateY(-100%)";
          setTimeout(() => overlay.remove(), 1000);
        }
      }
    }, 90);
  }

  /* ---------------- Year stamp ---------------- */
  function initYearStamp() {
    document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    initYearStamp();
    initIntro();
    initLenis();
    initCursor();
    initParallax();
    initMagnetic();
    initNav();
    initRevealsFallback();
    // Defer GSAP a tick to ensure stylesheet ready
    requestAnimationFrame(initGSAP);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
