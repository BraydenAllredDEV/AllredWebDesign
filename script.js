const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const yearTarget = document.querySelector("[data-year]");
const cursorAura = document.querySelector("[data-cursor-aura]");
const introLoader = document.querySelector("[data-intro-loader]");
const root = document.documentElement;
const reduceMotion =
  !body.classList.contains("motion-forward") &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

body.classList.add("motion-ready");

const introStartedAt = performance.now();
let introFinished = false;

const completeIntro = () => {
  if (introFinished) return;
  introFinished = true;
  body.classList.add("intro-complete");
  window.setTimeout(() => introLoader?.remove(), 650);
};

if (introLoader) {
  const fadeIntroAfterHold = () => {
    const remainingHold = Math.max(1000 - (performance.now() - introStartedAt), 0);
    window.setTimeout(completeIntro, remainingHold);
  };

  window.setTimeout(completeIntro, 2200);
  window.addEventListener("load", fadeIntroAfterHold, { once: true });
}

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealTargets = document.querySelectorAll(
  ".section-heading, .service-card, .feature-copy, .feature-band img, .price-card, .timeline article, .contact-panel, .contact-card, .proof-strip"
);

revealTargets.forEach((target, index) => {
  target.classList.add("reveal");
  target.style.setProperty("--stagger", String(index % 5));
});

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.14 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const setPointerPosition = (event) => {
  if (reduceMotion || !cursorAura) return;

  body.classList.add("has-pointer");
  root.style.setProperty("--cursor-x", `${event.clientX}px`);
  root.style.setProperty("--cursor-y", `${event.clientY}px`);

  const x = (event.clientX / window.innerWidth - 0.5) * 18;
  const y = (event.clientY / window.innerHeight - 0.5) * 14;
  root.style.setProperty("--hero-pan-x", `${x.toFixed(2)}px`);
  root.style.setProperty("--hero-pan-y", `${y.toFixed(2)}px`);
};

window.addEventListener("pointermove", setPointerPosition, { passive: true });
window.addEventListener("mousemove", setPointerPosition, { passive: true });
window.addEventListener(
  "pointerleave",
  () => {
    body.classList.remove("has-pointer");
    root.style.setProperty("--hero-pan-x", "0px");
    root.style.setProperty("--hero-pan-y", "0px");
  },
  { passive: true }
);

const tiltTargets = document.querySelectorAll(".service-card, .price-card, .timeline article, .contact-card");

tiltTargets.forEach((target) => {
  target.addEventListener(
    "pointermove",
    (event) => {
      if (reduceMotion) return;

      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      target.style.setProperty("--tilt-x", `${(x * 7).toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${(y * -7).toFixed(2)}deg`);
    },
    { passive: true }
  );

  target.addEventListener("pointerleave", () => {
    target.style.setProperty("--tilt-x", "0deg");
    target.style.setProperty("--tilt-y", "0deg");
  });
});

const counters = document.querySelectorAll("[data-counter]");

const animateCounter = (counter) => {
  const target = Number(counter.dataset.count || 0);
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";
  const duration = 900;
  const start = performance.now();

  const tick = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if (!reduceMotion && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.65 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}
