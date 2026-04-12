import { initViewer } from "./viewer";

const viewerEl = document.getElementById("viewer")!;
initViewer(viewerEl);

const waveIcon = document.querySelector<SVGElement>(".wave-icon")!;
waveIcon.addEventListener("click", () => {
  waveIcon.classList.remove("waving");
  void waveIcon.offsetWidth;
  waveIcon.classList.add("waving");
});
waveIcon.addEventListener("animationend", () => {
  waveIcon.classList.remove("waving");
});

const backdrop = document.getElementById("modal-backdrop")!;
const modal = document.getElementById("modal")!;
const modalProjectName = document.getElementById("modal-project-name")!;
const modalTopbarStatus = document.getElementById("modal-topbar-status")!;
const modalBody = document.getElementById("modal-body")!;
const modalClose = document.getElementById("modal-close")!;

type ProjectStatus = "shipped" | "wip" | "archived";

interface ProjectData {
  name: string;
  status: ProjectStatus;
  role: string;
  product: string;
  timeline: string;
  tools: string[];
  description: string;
  gallery?: string[];
}

const projectContent: Record<string, ProjectData> = {
  qarry: {
    name: "Qarry",
    status: "shipped",
    role: "Designer & Developer",
    product: "Web App",
    timeline: "Jan – Apr 2025",
    tools: ["Figma", "React", "Tailwind", "Laravel"],
    description:
      "A fully deployed fleet management dashboard for Qarry. Features real-time fleet tracking, detailed individual vehicle telemetry (trip history, battery, speed, etc.), and high-level data insights for in-house teams and customers.",
    gallery: [
      "/images/qarryshowcase/1.png",
      "/images/qarryshowcase/2.png",
      "/images/qarryshowcase/3.png",
      "/images/qarryshowcase/4.png",
      "/images/qarryshowcase/5.png",
      "/images/qarryshowcase/6.png",
    ],
  },
};

const statusLabels: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  wip: "In Progress",
  archived: "Archived",
};

function buildModalContent(data: ProjectData): string {
  const toolTags = data.tools
    .map((t) => `<span class="modal-tag">${t}</span>`)
    .join("");

  const gallery = data.gallery ?? [];

  const slides = gallery
    .map(
      (src, i) =>
        `<div class="modal-carousel-slide"><img src="${src}" alt="Screenshot ${i + 1}" draggable="false" /></div>`,
    )
    .join("");

  const dots = gallery
    .map(
      (_, i) =>
        `<button class="modal-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`,
    )
    .join("");

  const carousel =
    gallery.length > 0
      ? `<div class="modal-carousel">
          <div class="modal-carousel-viewport">
            <div class="modal-carousel-track">${slides}</div>
          </div>
          <button class="modal-carousel-arrow modal-carousel-prev" aria-label="Previous">
            <svg width="6" height="11" viewBox="0 0 6 11" fill="none"><path d="M5 1L1 5.5L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="modal-carousel-arrow modal-carousel-next" aria-label="Next">
            <svg width="6" height="11" viewBox="0 0 6 11" fill="none"><path d="M1 1L5 5.5L1 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="modal-carousel-dots">${dots}</div>
        </div>`
      : "";

  return `
    <div class="modal-content-inner">
      <div class="modal-meta">
        <div class="modal-meta-item">
          <span class="modal-meta-label">Role</span>
          <span class="modal-meta-value">${data.role}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Product</span>
          <span class="modal-meta-value">${data.product}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Timeline</span>
          <span class="modal-meta-value">${data.timeline}</span>
        </div>
      </div>
      <div class="modal-lower">
        <p class="modal-description">${data.description}</p>
        ${carousel}
        <div class="modal-tags">${toolTags}</div>
      </div>
    </div>
  `;
}

let carouselDragCleanup: (() => void) | null = null;
let carouselResizeObserver: ResizeObserver | null = null;

function initModalCarousel() {
  const carousel = modalBody.querySelector<HTMLElement>(".modal-carousel");
  if (!carousel) return;

  const viewport = carousel.querySelector<HTMLElement>(
    ".modal-carousel-viewport",
  )!;
  const track = carousel.querySelector<HTMLElement>(".modal-carousel-track")!;
  const slides = Array.from(
    carousel.querySelectorAll<HTMLElement>(".modal-carousel-slide"),
  );
  const allDots = carousel.querySelectorAll<HTMLButtonElement>(".modal-dot");
  const prevBtn = carousel.querySelector<HTMLButtonElement>(
    ".modal-carousel-prev",
  )!;
  const nextBtn = carousel.querySelector<HTMLButtonElement>(
    ".modal-carousel-next",
  )!;

  let current = 0;
  const total = slides.length;

  // Size each slide to the viewport width so pixel-based translation is exact
  let slideWidth = viewport.offsetWidth;
  slides.forEach((s) => {
    s.style.width = `${slideWidth}px`;
  });

  function goTo(index: number, animate = true) {
    current = ((index % total) + total) % total;
    track.style.transition = animate
      ? "transform 0.36s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      : "none";
    track.style.transform = `translateX(${-current * slideWidth}px)`;
    allDots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  let startX = 0;
  let dragX = 0;

  function settle() {
    const threshold = slideWidth * 0.3;
    if (dragX < -threshold) goTo(current + 1);
    else if (dragX > threshold) goTo(current - 1);
    else goTo(current);
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  allDots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

  // Touch drag — tracks finger in real time
  viewport.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      dragX = 0;
      track.style.transition = "none";
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchmove",
    (e) => {
      dragX = e.touches[0].clientX - startX;
      track.style.transform = `translateX(${-current * slideWidth + dragX}px)`;
    },
    { passive: true },
  );

  viewport.addEventListener("touchend", settle);

  // Mouse drag — attaches move/up to window so it survives leaving the element
  viewport.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    dragX = 0;
    track.style.transition = "none";
    viewport.style.cursor = "grabbing";
    e.preventDefault();

    function onMove(e: MouseEvent) {
      dragX = e.clientX - startX;
      track.style.transform = `translateX(${-current * slideWidth + dragX}px)`;
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      carouselDragCleanup = null;
      viewport.style.cursor = "grab";
      settle();
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    carouselDragCleanup = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  });

  // Re-snap on resize (e.g. orientation change on mobile)
  carouselResizeObserver = new ResizeObserver(() => {
    slideWidth = viewport.offsetWidth;
    slides.forEach((s) => {
      s.style.width = `${slideWidth}px`;
    });
    goTo(current, false);
  });
  carouselResizeObserver.observe(viewport);
}

function openModal(project: string, card: HTMLElement) {
  const data = projectContent[project];
  if (!data) return;

  // Set origin so the modal grows from the clicked card
  const rect = card.getBoundingClientRect();
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const cardCX = rect.left + rect.width / 2;
  const cardCY = rect.top + rect.height / 2;
  const modalW = Math.min(660, vpW - 40);
  const modalH = vpH * 0.8;
  const scale = Math.min(
    (rect.width / modalW) * 1.05,
    (rect.height / modalH) * 1.05,
    0.42,
  );
  modal.style.setProperty("--card-x", `${cardCX - vpW / 2}px`);
  modal.style.setProperty("--card-y", `${cardCY - vpH / 2}px`);
  modal.style.setProperty("--card-scale", scale.toFixed(3));

  modalProjectName.textContent = data.name;
  modalTopbarStatus.innerHTML = `<span class="modal-status-dot modal-status-dot--${data.status}"></span>${statusLabels[data.status]}`;
  modalBody.innerHTML = buildModalContent(data);
  initModalCarousel();

  modal.classList.remove("is-open", "is-closing", "is-animating");
  void modal.offsetWidth;
  modal.classList.add("is-open", "is-animating");
  modal.addEventListener(
    "animationend",
    () => modal.classList.remove("is-animating"),
    { once: true },
  );

  const scrollbarWidth = vpW - document.documentElement.clientWidth;
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.body.style.overflow = "hidden";
  backdrop.classList.add("open");
}

function closeModal() {
  carouselDragCleanup?.();
  carouselDragCleanup = null;
  carouselResizeObserver?.disconnect();
  carouselResizeObserver = null;
  modal.classList.remove("is-open");
  modal.classList.add("is-closing");
  backdrop.classList.remove("open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  modal.addEventListener(
    "animationend",
    () => modal.classList.remove("is-closing"),
    { once: true },
  );
}

document
  .querySelectorAll<HTMLElement>(".venture-card[data-project]")
  .forEach((card) => {
    card.addEventListener("click", () =>
      openModal(card.dataset.project!, card),
    );
  });

modalClose.addEventListener("click", closeModal);
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Magnetic social buttons
document.querySelectorAll<HTMLElement>(".social-btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    btn.style.transform = `translate(${dx * 9}px, ${dy * 9}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});
