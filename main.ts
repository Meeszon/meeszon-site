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
    tools: ["Figma", "TypeScript", "React"],
    description: "Qarry.",
    gallery: [],
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

  const gallery =
    data.gallery && data.gallery.length > 0
      ? `<div class="modal-gallery">${data.gallery.map((src) => `<img src="${src}" alt="" />`).join("")}</div>`
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
        <div class="modal-tags">${toolTags}</div>
        ${gallery}
      </div>
    </div>
  `;
}

function openModal(project: string) {
  const data = projectContent[project];
  if (!data) return;
  modalProjectName.textContent = data.name;
  modalTopbarStatus.innerHTML = `<span class="modal-status-dot modal-status-dot--${data.status}"></span>${statusLabels[data.status]}`;
  modalBody.innerHTML = buildModalContent(data);
  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  backdrop.classList.remove("open");
  document.body.style.overflow = "";
}

document
  .querySelectorAll<HTMLElement>(".venture-card[data-project]")
  .forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.project!));
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
