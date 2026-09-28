const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageLoader = document.querySelector("#page-loader");

if (pageLoader) {
  if (reducedMotion) {
    pageLoader.remove();
  } else {
    const loaderProgress = pageLoader.querySelector(".loader-progress");
    const loaderCount = document.querySelector("#loader-count");
    const progressBar = pageLoader.querySelector(".loader-track");
    const startTime = performance.now();
    const minimumDuration = 1050;
    const maximumDuration = 1650;
    let pageLoaded = document.readyState === "complete";
    let loaderInterval;

    window.addEventListener("load", () => { pageLoaded = true; }, { once: true });

    function updateLoader(now) {
      const elapsed = now - startTime;
      const timedProgress = Math.min(elapsed / minimumDuration, 1);
      const waitingForPage = !pageLoaded && elapsed < maximumDuration;
      const percent = waitingForPage ? Math.min(Math.floor(timedProgress * 100), 94) : Math.floor(timedProgress * 100);
      loaderProgress.style.setProperty("--loader-progress", `${percent}%`);
      loaderCount.textContent = String(percent).padStart(2, "0");
      progressBar.setAttribute("aria-valuenow", String(percent));

      if (elapsed >= minimumDuration && (!waitingForPage || elapsed >= maximumDuration)) {
        loaderProgress.style.setProperty("--loader-progress", "100%");
        loaderCount.textContent = "100";
        progressBar.setAttribute("aria-valuenow", "100");
        pageLoader.classList.add("is-complete");
        window.clearInterval(loaderInterval);
        window.setTimeout(() => pageLoader.remove(), 380);
        return;
      }
    }

    updateLoader(startTime);
    loaderInterval = window.setInterval(() => updateLoader(performance.now()), 25);
  }
}

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const navigationLinks = [...document.querySelectorAll(".primary-navigation a")];

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !isOpen);
});

navigationLinks.forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => {
  if (window.innerWidth > 620) closeMenu();
});

const revealElements = document.querySelectorAll("[data-reveal]");
function revealVisibleElements() {
  revealElements.forEach((element) => {
    if (element.classList.contains("is-visible")) return;
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0) {
      element.classList.add("is-visible");
    }
  });
}

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealElements.forEach((element) => revealObserver.observe(element));
}
window.addEventListener("scroll", revealVisibleElements, { passive: true });
requestAnimationFrame(revealVisibleElements);

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = reducedMotion ? 0 : 900;
  const start = performance.now();

  function update(now) {
    const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${String(Math.round(target * eased)).padStart(2, "0")}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counters = document.querySelectorAll("[data-count]");
if ("IntersectionObserver" in window && !reducedMotion) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.7 });
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => animateCounter(counter));
}

function updateNepalClock() {
  const clock = document.querySelector("#nepal-clock");
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(new Date());
  clock.textContent = `${time} NPT`;
}

updateNepalClock();
window.setInterval(updateNepalClock, 1000);

const observedSections = ["about", "work", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
    if (!visible) return;
    navigationLinks.forEach((link) => {
      const isActive = link.hash === `#${visible.target.id}`;
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
      link.classList.toggle("is-active", isActive);
    });
  }, { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.5] });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll(".image-link img").forEach((image) => {
  image.addEventListener("error", () => image.closest(".image-link").classList.add("image-failed"), { once: true });
});