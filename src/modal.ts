/* ── Mees Portfolio · Browser window modal + Chrome tab bar ────────────
   - The chrome bar + page body together form a `HomeWindow` sitting on a
     `Desktop` (Win7 wallpaper). Its traffic lights close / minimize /
     toggle-maximize the whole thing; double-clicking the desktop shortcut
     restores it.
   - Each project card click opens a draggable browser-window modal that
     shares the same z-stack as the home window.
   - Tabs also serve as the dock: minimize flies the window into its tab,
     restore flies it back out.
   ─────────────────────────────────────────────────────────────────────── */

import { caseStudies } from "./case-studies";

type ProjectStatus = "shipped" | "wip" | "archived";

interface ProjectData {
  name: string;
  status: ProjectStatus;
  statusLabel: string;
  role: string;
  product: string;
  timeline: string;
  tools: string[];
  description: string;
  descriptionLink?: { text: string; href: string };
  gallery?: string[];
  slug: string;
  logoColor: string;
}

const projectContent: Record<string, ProjectData> = {
  mrr: {
    name: "MRR Drones",
    status: "wip",
    statusLabel: "In Progress",
    role: "Designer & Developer",
    product: "Web App",
    timeline: "Feb 2026 – Present",
    tools: ["Figma", "React", "SCSS", "UX Research"],
    description:
      "MRR Drones builds autonomous drone flight software. I am currently redesigning and developing the front-end for their application, overhauling the user flows to make them intuitive and easy to use, particularly on small screens like the DJI Remote.",
    descriptionLink: { text: "MRR Drones", href: "https://multirotorresearch.com/" },
    gallery: ["/images/mrrshowcase/0.png", "/images/mrrshowcase/1.png"],
    slug: "mrr-drones",
    logoColor: "#3D5AF2",
  },
  qarry: {
    name: "Qarry",
    status: "shipped",
    statusLabel: "Shipped",
    role: "Designer & Developer",
    product: "Web App",
    timeline: "Jan – Jul 2025",
    tools: ["Figma", "React", "Tailwind", "Shadcn", "Laravel", "Inertia"],
    description:
      "A fleet management dashboard for Qarry. Live tracking across 240 vehicles, per-vehicle telemetry from ~45 on-board data points (trip history, battery, cell temps, voltage usage), and fleet analytics split into a customer view and a deeper in-house view.",
    descriptionLink: { text: "Qarry", href: "https://qarry.com" },
    gallery: [
      "/images/qarryshowcase/0.png",
      "/images/qarryshowcase/design-list.jpg",
      "/images/qarryshowcase/design-maplist.jpg",
      "/images/qarryshowcase/design-infomap.jpg",
      "/images/qarryshowcase/design-highfidelity.jpg",
      "/images/qarryshowcase/2.png",
      "/images/qarryshowcase/4.png",
      "/images/qarryshowcase/5.png",
      "/images/qarryshowcase/6.png",
      "/images/qarryshowcase/vehicledrawing.png",
      "/images/qarryshowcase/mobile1.png",
      "/images/qarryshowcase/mobile2.png",
    ],
    slug: "qarry",
    logoColor: "#fce36a",
  },
  bathforge: {
    name: "Bathforge",
    status: "shipped",
    statusLabel: "Shipped",
    role: "Developer",
    product: "Web App",
    timeline: "Sep – Dec 2025",
    tools: ["React", "Three.js", "Java", "Spring Boot"],
    description:
      "A 3D bathroom configurator built for New Living Design GmbH. Users input the dimensions of their bathroom and the app generates a Three.js room. Products from the catalogue can then be placed, moved, and styled inside the space.",
    gallery: [
      "/images/newlivingshowcase/0.png",
      "/images/newlivingshowcase/1.png",
      "/images/newlivingshowcase/2.png",
      "/images/newlivingshowcase/3.png",
    ],
    slug: "bathforge",
    logoColor: "#94A3B8",
  },
};

let homeWindow: HomeWindow;

// ── Drag plumbing ───────────────────────────────────────────────────────
// Shared utility used by both BrowserWindow titlebars and HomeWindow's
// tabs row. Emits cumulative deltas from the press point; the caller
// stores its own starting position in `onStart`.
interface DraggableOpts {
  handle: HTMLElement;
  isEnabled?: () => boolean;
  onStart?: () => void;
  onMove: (dx: number, dy: number) => void;
  onEnd?: () => void;
}
function makeDraggable(opts: DraggableOpts) {
  let startMouseX = 0;
  let startMouseY = 0;

  const readPoint = (e: MouseEvent | TouchEvent): [number, number] | null => {
    const me = e as MouseEvent;
    const te = e as TouchEvent;
    const cx = me.clientX ?? te.touches?.[0]?.clientX;
    const cy = me.clientY ?? te.touches?.[0]?.clientY;
    if (cx == null || cy == null) return null;
    return [cx, cy];
  };
  const onMove = (e: MouseEvent | TouchEvent) => {
    const p = readPoint(e);
    if (!p) return;
    opts.onMove(p[0] - startMouseX, p[1] - startMouseY);
  };
  const onUp = () => {
    window.removeEventListener("mousemove", onMove as EventListener);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchmove", onMove as EventListener);
    window.removeEventListener("touchend", onUp);
    opts.onEnd?.();
  };
  const onDown = (e: MouseEvent | TouchEvent) => {
    if (opts.isEnabled && !opts.isEnabled()) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    const p = readPoint(e);
    if (!p) return;
    [startMouseX, startMouseY] = p;
    opts.onStart?.();
    window.addEventListener("mousemove", onMove as EventListener);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove as EventListener, { passive: true });
    window.addEventListener("touchend", onUp);
    if (e.cancelable) e.preventDefault();
  };
  opts.handle.addEventListener("mousedown", onDown as EventListener);
  opts.handle.addEventListener("touchstart", onDown as EventListener, { passive: false });
}

interface TabBarType {
  tabsEl: HTMLElement | null;
  homeTabEl: HTMLElement | null;
  urlPathEl: HTMLElement | null;
  menuEl: HTMLElement | null;
  newTabBtn: HTMLElement | null;
  init(): void;
  openMenu(): void;
  closeMenu(): void;
  addProjectTab(projectKey: string, data: ProjectData): void;
  removeProjectTab(projectKey: string): void;
  setActive(projectKey: string): void;
  getTabRect(projectKey: string): DOMRect | null;
  goHome(): void;
}

const TabBar: TabBarType = {
  tabsEl: null,
  homeTabEl: null,
  urlPathEl: null,
  menuEl: null,
  newTabBtn: null,

  init() {
    this.tabsEl = document.getElementById("chrome-tabs");
    this.homeTabEl = document.querySelector<HTMLElement>('.chrome-tab[data-key="home"]');
    this.urlPathEl = document.getElementById("chrome-url-path");
    this.menuEl = document.getElementById("chrome-new-menu");
    this.newTabBtn = document.getElementById("chrome-new-tab");

    this.homeTabEl?.addEventListener("click", () => this.goHome());

    document.getElementById("chrome-reload")?.addEventListener("click", () => {
      const svg = document.querySelector<SVGElement>("#chrome-reload svg");
      if (!svg) return;
      svg.style.transform = "rotate(360deg)";
      setTimeout(() => { svg.style.transform = ""; }, 510);
    });

    // New-tab menu
    this.newTabBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.menuEl?.hidden) this.openMenu();
      else this.closeMenu();
    });
    document.addEventListener("click", (e) => {
      if (this.menuEl && !this.menuEl.hidden && !this.menuEl.contains(e.target as Node) && e.target !== this.newTabBtn) {
        this.closeMenu();
      }
    });

    // Clock in the top-right
    const timeEl = document.getElementById("chrome-time");
    if (timeEl) {
      const tick = () => {
        const d = new Date();
        timeEl.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      };
      tick();
      setInterval(tick, 30000);
    }
  },

  openMenu() {
    if (!this.menuEl) return;
    this.menuEl.innerHTML = "";
    const entries = Object.entries(projectContent);
    if (!entries.length) {
      this.menuEl.innerHTML = `<div class="chrome-new-menu-empty">No projects</div>`;
    } else {
      entries.forEach(([key, data]) => {
        const isOpen = WindowManager.openWindows.has(key) || WindowManager.minimized.has(key);
        const item = document.createElement("div");
        item.className = "chrome-new-menu-item" + (isOpen ? " is-open" : "");
        item.style.setProperty("--logo-color", data.logoColor);
        item.innerHTML = `<span class="chrome-new-menu-item-dot"></span><span>${data.name}</span>`;
        item.addEventListener("click", () => {
          this.closeMenu();
          const card = document.querySelector<HTMLElement>(`.venture-card[data-project="${key}"]`);
          WindowManager.open(key, card);
        });
        this.menuEl!.appendChild(item);
      });
    }
    this.menuEl.hidden = false;
  },

  closeMenu() { if (this.menuEl) this.menuEl.hidden = true; },

  addProjectTab(projectKey, data) {
    if (!this.tabsEl) return;
    if (this.tabsEl.querySelector(`.chrome-tab[data-key="${projectKey}"]`)) return;
    const tab = document.createElement("div");
    tab.className = "chrome-tab project-tab";
    tab.dataset.key = projectKey;
    tab.style.setProperty("--logo-color", data.logoColor);
    tab.tabIndex = 0;
    tab.innerHTML = `
      <span class="chrome-tab-favicon"></span>
      <span class="chrome-tab-title">${data.name}</span>
      <button class="chrome-tab-close" aria-label="Close tab">×</button>
    `;
    tab.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".chrome-tab-close")) {
        e.stopPropagation();
        WindowManager.close(projectKey);
        return;
      }
      if (WindowManager.minimized.has(projectKey)) {
        WindowManager.restore(projectKey);
      } else if (WindowManager.openWindows.has(projectKey)) {
        WindowManager.focus(projectKey);
        this.setActive(projectKey);
      }
    });
    this.tabsEl.appendChild(tab);
  },

  removeProjectTab(projectKey) {
    const tab = this.tabsEl?.querySelector(`.chrome-tab[data-key="${projectKey}"]`);
    if (tab) tab.remove();
  },

  setActive(projectKey) {
    this.homeTabEl?.classList.toggle("active", projectKey === "home");
    this.tabsEl?.querySelectorAll<HTMLElement>(".chrome-tab.project-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.key === projectKey);
    });
    if (!this.urlPathEl) return;
    if (projectKey === "home") {
      this.urlPathEl.textContent = "/";
    } else {
      const data = projectContent[projectKey];
      if (data) this.urlPathEl.textContent = `/projects/${data.slug}`;
    }
  },

  getTabRect(projectKey) {
    const el = projectKey === "home"
      ? this.homeTabEl
      : this.tabsEl?.querySelector<HTMLElement>(`.chrome-tab[data-key="${projectKey}"]`);
    return el?.getBoundingClientRect() ?? null;
  },

  goHome() {
    homeWindow.bringToFront();
  },
};

const WindowManager = {
  openWindows: new Map<string, BrowserWindow>(),
  minimized: new Map<string, BrowserWindow>(),
  zCounter: 100,

  open(projectKey: string, sourceCardEl: HTMLElement | null) {
    if (this.openWindows.has(projectKey)) {
      this.focus(projectKey);
      TabBar.setActive(projectKey);
      return;
    }
    if (this.minimized.has(projectKey)) {
      this.restore(projectKey);
      return;
    }
    const data = projectContent[projectKey];
    if (!data) return;
    TabBar.addProjectTab(projectKey, data);
    const win = new BrowserWindow(projectKey, sourceCardEl);
    this.openWindows.set(projectKey, win);
    TabBar.setActive(projectKey);
  },

  focus(key: string) {
    const win = this.openWindows.get(key);
    if (!win) return;
    this.zCounter += 1;
    win.node.style.zIndex = String(this.zCounter);
    TabBar.setActive(key);
  },

  close(key: string) {
    const open = this.openWindows.get(key);
    const mini = this.minimized.get(key);
    if (open) {
      open.close();
      this.openWindows.delete(key);
    } else if (mini) {
      mini.node.remove();
      this.minimized.delete(key);
    } else {
      return;
    }
    TabBar.removeProjectTab(key);
    if (this.openWindows.size > 0) {
      const lastKey = Array.from(this.openWindows.keys()).pop()!;
      this.focus(lastKey);
    } else {
      TabBar.setActive("home");
    }
  },

  minimize(key: string) {
    const win = this.openWindows.get(key);
    if (!win) return;
    win.minimize();
    this.openWindows.delete(key);
    this.minimized.set(key, win);
    if (this.openWindows.size > 0) {
      const lastKey = Array.from(this.openWindows.keys()).pop()!;
      this.focus(lastKey);
    } else {
      TabBar.setActive("home");
    }
  },

  restore(key: string) {
    const win = this.minimized.get(key);
    if (!win) return;
    win.restore();
    this.minimized.delete(key);
    this.openWindows.set(key, win);
    this.zCounter += 1;
    win.node.style.zIndex = String(this.zCounter);
    TabBar.setActive(key);
  },
};

class BrowserWindow {
  key: string;
  data: ProjectData;
  sourceEl: HTMLElement | null;
  node: HTMLElement;
  x = 0;
  y = 0;
  isDragging = false;
  lightbox: HTMLElement | null = null;
  private carouselGoTo: ((i: number, animate?: boolean) => void) | null = null;

  constructor(projectKey: string, sourceEl: HTMLElement | null) {
    this.key = projectKey;
    this.data = projectContent[projectKey];
    this.sourceEl = sourceEl;

    this.node = this.build();
    document.body.appendChild(this.node);
    this.setupDrag();
    this.setupCarousel();
    this.setupCaseStudy();

    WindowManager.zCounter += 1;
    this.node.style.zIndex = String(WindowManager.zCounter);
    this.animateOpen();
  }

  private build(): HTMLElement {
    const d = this.data;
    const node = document.createElement("div");
    node.className = "win";
    node.dataset.key = this.key;

    const caseStudyFn = caseStudies[this.key];
    const hasCaseStudy = typeof caseStudyFn === "function";

    const slides = !hasCaseStudy ? (d.gallery || []).map((src, i) =>
      `<div class="win-carousel-slide">
        <img ${i === 0 ? `src="${src}"` : `data-src="${src}"`} alt="Screenshot ${i + 1}" draggable="false" />
      </div>`
    ).join("") : "";

    const dots = !hasCaseStudy ? (d.gallery || []).map((_, i) =>
      `<button class="modal-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join("") : "";

    const carouselHTML = (!hasCaseStudy && d.gallery && d.gallery.length)
      ? `<div class="win-carousel">
          <div class="win-carousel-viewport">
            <div class="win-carousel-track">${slides}</div>
          </div>
          <button class="win-carousel-arrow win-carousel-prev" aria-label="Previous">
            <svg width="7" height="12" viewBox="0 0 6 11" fill="none"><path d="M5 1L1 5.5L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="win-carousel-arrow win-carousel-next" aria-label="Next">
            <svg width="7" height="12" viewBox="0 0 6 11" fill="none"><path d="M1 1L5 5.5L1 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="win-carousel-dots">${dots}</div>
        </div>`
      : "";

    const toolTags = d.tools.map((t) => `<span class="modal-tag">${t}</span>`).join("");

    let desc = d.description;
    if (d.descriptionLink) {
      desc = desc.replace(d.descriptionLink.text,
        `<a href="${d.descriptionLink.href}" target="_blank" rel="noopener">${d.descriptionLink.text}</a>`);
    }

    const slug = d.slug;
    const imageCount = (d.gallery && d.gallery.length) || 0;

    const shortBodyHTML = `
      <div class="modal-meta">
        <div class="modal-meta-item">
          <span class="modal-meta-label">Role</span>
          <span class="modal-meta-value">${d.role}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Product</span>
          <span class="modal-meta-value">${d.product}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Timeline</span>
          <span class="modal-meta-value">${d.timeline}</span>
        </div>
      </div>
      <div class="modal-lower">
        <p class="modal-description">${desc}</p>
        ${carouselHTML}
        <div class="modal-tags">${toolTags}</div>
      </div>
    `;
    const bodyInner = hasCaseStudy ? caseStudyFn() : shortBodyHTML;

    node.innerHTML = `
      <div class="win-titlebar">
        <div class="win-lights">
          <button class="win-light win-light--close" data-act="close" aria-label="Close"></button>
          <button class="win-light win-light--minimize" data-act="minimize" aria-label="Minimize"></button>
          <button class="win-light win-light--maximize" data-act="maximize" aria-label="Toggle"></button>
        </div>
        <div class="win-title">
          ${d.name}
          <span class="win-title-dot">·</span>
          <span class="win-title-status">${d.statusLabel}</span>
        </div>
        <div class="win-titlebar-right">/projects/${slug}</div>
      </div>
      <div class="win-addr">
        <div class="win-addr-nav">
          <button class="win-addr-btn" aria-label="Back" disabled>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7 1L2.5 5.5L7 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="win-addr-btn" aria-label="Forward" disabled>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M4 1L8.5 5.5L4 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div class="win-url">
          <span class="domain">meeszon.dev</span>
          <span class="path">/projects/${slug}</span>
        </div>
        <button class="win-refresh" aria-label="Reload">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M11 5.5C10.5 3.2 8.5 1.5 6 1.5C3 1.5 1 3.5 1 6.5C1 9.5 3 11.5 6 11.5C8.4 11.5 10.4 9.9 11 7.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M11 1.5V5.5H7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="win-body${hasCaseStudy ? " win-body--case-study" : ""}">
        <div class="win-content">
          ${bodyInner}
        </div>
      </div>
      <div class="win-status">
        <span class="win-status-item"><span class="doc-dot"></span>Done</span>
        <span class="win-status-item">${imageCount} image${imageCount === 1 ? "" : "s"}</span>
        <span class="win-status-item">${d.tools.length} deps</span>
        <span class="win-status-spacer"></span>
        <span class="win-status-item">UTF-8</span>
        <span class="win-status-item">100%</span>
      </div>
    `;

    node.querySelector<HTMLButtonElement>('[data-act="close"]')!.addEventListener("click", (e) => {
      e.stopPropagation();
      WindowManager.close(this.key);
    });
    node.querySelector<HTMLButtonElement>('[data-act="minimize"]')!.addEventListener("click", (e) => {
      e.stopPropagation();
      WindowManager.minimize(this.key);
    });
    node.querySelector<HTMLButtonElement>('[data-act="maximize"]')!.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMaximize();
    });
    node.querySelector<HTMLButtonElement>(".win-refresh")!.addEventListener("click", (e) => {
      e.stopPropagation();
      const svg = (e.currentTarget as HTMLElement).querySelector<SVGElement>("svg");
      if (!svg) return;
      svg.style.transform = "rotate(360deg)";
      svg.style.transition = "transform 0.5s ease";
      setTimeout(() => { svg.style.transition = "none"; svg.style.transform = ""; }, 510);
    });
    node.addEventListener("mousedown", () => WindowManager.focus(this.key), true);

    return node;
  }

  private setupDrag() {
    const titlebar = this.node.querySelector<HTMLElement>(".win-titlebar")!;
    let startX = 0, startY = 0;
    makeDraggable({
      handle: titlebar,
      onStart: () => {
        startX = this.x;
        startY = this.y;
        this.isDragging = true;
        this.node.classList.add("dragging");
        WindowManager.focus(this.key);
      },
      onMove: (dx, dy) => {
        this.x = startX + dx;
        this.y = startY + dy;
        this.applyPosition();
      },
      onEnd: () => {
        this.isDragging = false;
        this.node.classList.remove("dragging");
      },
    });
  }

  private applyPosition() {
    this.node.style.setProperty("--rest-x", `${this.x}px`);
    this.node.style.setProperty("--rest-y", `${this.y}px`);
  }

  /** Point --src-x/--src-y/--src-scale at the source card's current rect. */
  private updateSourceVars() {
    const rect = this.sourceEl?.getBoundingClientRect();
    if (!rect) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const winW = this.node.offsetWidth || 720;
    const scale = Math.max(0.08, Math.min(0.6, rect.width / winW));
    this.node.style.setProperty("--src-x", `${cx - vw / 2}px`);
    this.node.style.setProperty("--src-y", `${cy - vh / 2}px`);
    this.node.style.setProperty("--src-scale", `${scale}`);
  }

  private animateOpen() {
    this.applyPosition();
    this.updateSourceVars();
    requestAnimationFrame(() => {
      this.node.classList.add("is-opening");
      this.node.addEventListener("animationend", () => {
        this.node.classList.remove("is-opening");
      }, { once: true });
    });
  }

  close() {
    this.node.remove();
    this.lightbox?.remove();
  }

  minimize() {
    const tabRect = TabBar.getTabRect(this.key);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let dockX = 0, dockY = -vh / 2 + 18;
    if (tabRect) {
      dockX = (tabRect.left + tabRect.width / 2) - vw / 2;
      dockY = (tabRect.top + tabRect.height / 2) - vh / 2;
    }
    this.node.style.setProperty("--dock-x", `${dockX}px`);
    this.node.style.setProperty("--dock-y", `${dockY}px`);
    this.node.classList.remove("is-opening", "is-restoring");
    this.node.classList.add("is-minimized");
    this.node.addEventListener("animationend", () => {
      this.node.classList.remove("is-minimized");
      this.node.style.display = "none";
    }, { once: true });
  }

  restore() {
    const tabRect = TabBar.getTabRect(this.key);
    if (tabRect) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dockX = (tabRect.left + tabRect.width / 2) - vw / 2;
      const dockY = (tabRect.top + tabRect.height / 2) - vh / 2;
      this.node.style.setProperty("--dock-x", `${dockX}px`);
      this.node.style.setProperty("--dock-y", `${dockY}px`);
    }
    this.node.style.display = "";
    this.node.classList.remove("is-minimized");
    this.node.classList.add("is-restoring");
    WindowManager.zCounter += 1;
    this.node.style.zIndex = String(WindowManager.zCounter);
    this.node.addEventListener("animationend", () => {
      this.node.classList.remove("is-restoring");
    }, { once: true });
  }

  private toggleMaximize() {
    if (this.node.dataset.maxed === "1") {
      this.node.style.width = "";
      this.node.style.height = "";
      this.x = 0; this.y = 0;
      this.applyPosition();
      delete this.node.dataset.maxed;
    } else {
      const w = Math.floor(Math.min(window.innerWidth - 24, 1100) / 2) * 2;
      const h = Math.floor((window.innerHeight - 24) / 2) * 2;
      this.node.style.width = `${w}px`;
      this.node.style.height = `${h}px`;
      this.x = 0; this.y = 0;
      this.applyPosition();
      this.node.dataset.maxed = "1";
    }
  }

  private setupCaseStudy() {
    const cs = this.node.querySelector<HTMLElement>(".case-study");
    if (!cs) return;
    const body = this.node.querySelector<HTMLElement>(".win-body");
    if (!body) return;

    // TOC scroll-jumps (anchor links scroll the body, not the page)
    cs.querySelectorAll<HTMLAnchorElement>("[data-cs-jump]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = cs.querySelector<HTMLElement>(link.getAttribute("href")!);
        if (!target) return;
        const toc = cs.querySelector<HTMLElement>(".cs-toc");
        const tocH = toc ? toc.getBoundingClientRect().height : 0;
        const offsetTop = target.offsetTop - tocH - 8;
        body.scrollTo({ top: offsetTop, behavior: "smooth" });
      });
    });

    // Highlight current section in TOC as we scroll
    const sections = Array.from(cs.querySelectorAll<HTMLElement>(".cs-section, .cs-hero"));
    const tocLinks = Array.from(cs.querySelectorAll<HTMLAnchorElement>("[data-cs-jump]"));
    const linkFor = (id: string) => tocLinks.find((l) => l.getAttribute("href") === "#" + id);
    let activeId: string | null = null;
    const updateActive = () => {
      const toc = cs.querySelector<HTMLElement>(".cs-toc");
      const tocH = toc ? toc.getBoundingClientRect().height : 0;
      const probe = body.scrollTop + tocH + 24;
      let current: string | null = null;
      for (const s of sections) {
        if (s.offsetTop <= probe) current = s.id || null;
      }
      if (current !== activeId) {
        activeId = current;
        tocLinks.forEach((l) => l.classList.remove("is-active"));
        if (activeId) linkFor(activeId)?.classList.add("is-active");
      }
    };
    body.addEventListener("scroll", updateActive, { passive: true });
    requestAnimationFrame(updateActive);

    // Clickable case-study images → lightbox
    const csImgs = Array.from(cs.querySelectorAll<HTMLImageElement>(
      ".cs-laptop-screen img, .cs-screen-frame img"
    ));
    if (csImgs.length) {
      const slideEls = csImgs.map((img) => {
        const slide = document.createElement("div");
        const inner = document.createElement("img");
        inner.src = img.src;
        slide.appendChild(inner);
        (slide as HTMLElement & { _sourceImg?: HTMLImageElement })._sourceImg = img;
        return slide;
      });
      csImgs.forEach((img, idx) => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", (e) => {
          e.stopPropagation();
          // Refresh src in case lazy-loaded after first build
          slideEls.forEach((s) => {
            const liveSrc = (s as HTMLElement & { _sourceImg?: HTMLImageElement })._sourceImg?.src;
            const innerImg = s.querySelector<HTMLImageElement>("img");
            if (liveSrc && innerImg) innerImg.src = liveSrc;
          });
          this.openLightbox(slideEls, idx);
        });
      });
    }
  }

  private setupCarousel() {
    const carousel = this.node.querySelector<HTMLElement>(".win-carousel");
    if (!carousel) return;

    const viewport = carousel.querySelector<HTMLElement>(".win-carousel-viewport")!;
    const track    = carousel.querySelector<HTMLElement>(".win-carousel-track")!;
    const slides   = Array.from(carousel.querySelectorAll<HTMLElement>(".win-carousel-slide"));
    const dots     = carousel.querySelectorAll<HTMLButtonElement>(".modal-dot");
    const prevBtn  = carousel.querySelector<HTMLButtonElement>(".win-carousel-prev")!;
    const nextBtn  = carousel.querySelector<HTMLButtonElement>(".win-carousel-next")!;

    let current = 0;
    const total = slides.length;
    let slideWidth = 0;

    const loadSlide = (i: number) => {
      const s = slides[((i % total) + total) % total];
      const img = s?.querySelector<HTMLImageElement>("img");
      if (img?.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    };

    const resize = () => {
      slideWidth = viewport.offsetWidth;
      slides.forEach((s) => (s.style.width = `${slideWidth}px`));
      goTo(current, false);
    };

    const goTo = (i: number, animate = true) => {
      current = ((i % total) + total) % total;
      track.style.transition = animate
        ? "transform 0.36s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        : "none";
      track.style.transform = `translateX(${-current * slideWidth}px)`;
      dots.forEach((d, idx) => d.classList.toggle("active", idx === current));
      loadSlide(current);
      loadSlide(current + 1);
    };

    resize();
    loadSlide(1);

    const ro = new ResizeObserver(resize);
    ro.observe(viewport);

    let startX = 0, dragX = 0;
    const settle = () => {
      const threshold = slideWidth * 0.3;
      if (dragX < -threshold) goTo(current + 1);
      else if (dragX > threshold) goTo(current - 1);
      else goTo(current);
    };

    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goTo(current - 1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goTo(current + 1); });
    dots.forEach((d, i) => d.addEventListener("click", (e) => { e.stopPropagation(); goTo(i); }));

    viewport.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      startX = e.clientX;
      dragX = 0;
      track.style.transition = "none";
      viewport.style.cursor = "grabbing";
      e.preventDefault();

      const onMove = (ev: MouseEvent) => {
        dragX = ev.clientX - startX;
        track.style.transform = `translateX(${-current * slideWidth + dragX}px)`;
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        viewport.style.cursor = "zoom-in";
        if (Math.abs(dragX) < 5) this.openLightbox(slides, current);
        else settle();
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });

    viewport.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      dragX = 0;
      track.style.transition = "none";
    }, { passive: true });
    viewport.addEventListener("touchmove", (e) => {
      dragX = e.touches[0].clientX - startX;
      track.style.transform = `translateX(${-current * slideWidth + dragX}px)`;
    }, { passive: true });
    viewport.addEventListener("touchend", () => {
      if (Math.abs(dragX) < 5) this.openLightbox(slides, current);
      else settle();
    });

    this.carouselGoTo = goTo;
  }

  private openLightbox(slides: HTMLElement[], idx: number) {
    const total = slides.length;
    if (this.lightbox) this.lightbox.remove();
    const lb = document.createElement("div");
    lb.className = "lightbox";
    const dotsHTML = total > 1 ? Array.from({ length: total }, (_, i) =>
      `<button class="modal-dot${i === idx ? " active" : ""}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join("") : "";

    lb.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <button class="lightbox-close" aria-label="Close">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="lightbox-inner">
        ${total > 1 ? `<button class="lightbox-arrow lightbox-prev" aria-label="Previous">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>` : ""}
        <img class="lightbox-img" draggable="false" alt="" />
        ${total > 1 ? `<button class="lightbox-arrow lightbox-next" aria-label="Next">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1L7 7L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>` : ""}
      </div>
      ${total > 1 ? `<div class="lightbox-dots">${dotsHTML}</div>` : ""}
    `;
    document.body.appendChild(lb);
    this.lightbox = lb;

    let cur = idx;
    const imgEl = lb.querySelector<HTMLImageElement>(".lightbox-img")!;
    const lbDots = lb.querySelectorAll<HTMLButtonElement>(".modal-dot");

    const go = (i: number) => {
      cur = ((i % total) + total) % total;
      const slideImg = slides[cur].querySelector<HTMLImageElement>("img")!;
      if (slideImg.dataset.src) {
        slideImg.src = slideImg.dataset.src;
        delete slideImg.dataset.src;
      }
      imgEl.src = slideImg.src;
      lbDots.forEach((d, j) => d.classList.toggle("active", j === cur));
      this.carouselGoTo?.(cur, false);
    };
    go(cur);
    requestAnimationFrame(() => lb.classList.add("is-open"));

    const close = () => {
      lb.classList.remove("is-open");
      setTimeout(() => { lb.remove(); this.lightbox = null; }, 180);
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
      else if (e.key === "ArrowLeft") go(cur - 1);
      else if (e.key === "ArrowRight") go(cur + 1);
    };
    document.addEventListener("keydown", onKey);

    lb.querySelector<HTMLButtonElement>(".lightbox-close")!.addEventListener("click", close);
    lb.querySelector<HTMLElement>(".lightbox-backdrop")!.addEventListener("click", close);
    lb.querySelector<HTMLButtonElement>(".lightbox-prev")?.addEventListener("click", () => go(cur - 1));
    lb.querySelector<HTMLButtonElement>(".lightbox-next")?.addEventListener("click", () => go(cur + 1));
    lbDots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  }
}

// ── Desktop module ──────────────────────────────────────────────────────
// Owns the Win7 desktop layer's only interactive node: the desktop
// shortcut that restores the home window via double-click. Visibility
// toggling is driven by HomeWindow's state transitions.
const Desktop = {
  shortcutEl: null as HTMLElement | null,

  init(onRestoreRequest: () => void) {
    this.shortcutEl = document.getElementById("desktop-shortcut");
    if (!this.shortcutEl) return;
    this.shortcutEl.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      onRestoreRequest();
    });
  },

  setShortcutVisible(visible: boolean) {
    if (this.shortcutEl) this.shortcutEl.hidden = !visible;
  },
};

// ── HomeWindow ──────────────────────────────────────────────────────────
// The chrome bar + page body, treated as a single window. Owns the three
// new traffic lights on the chrome bar, the windowed drag offset, and the
// state machine: maximized | windowed | minimized | closed.
type HomeState = "maximized" | "windowed" | "minimized" | "closed";

interface PreservedHomeState {
  windowState: "maximized" | "windowed";
  scrollY: number;
  windowedX: number;
  windowedY: number;
}

class HomeWindow {
  node: HTMLElement;
  tabsRow: HTMLElement;
  pageEl: HTMLElement;
  state: HomeState = "maximized";
  windowedX = 0;
  windowedY = 0;
  private preserved: PreservedHomeState | null = null;

  constructor() {
    this.node = document.getElementById("home-window")!;
    this.tabsRow = this.node.querySelector<HTMLElement>(".chrome-row-tabs")!;
    this.pageEl = this.node.querySelector<HTMLElement>(".page")!;
    this.wireTrafficLights();
    this.wireDrag();
    this.node.addEventListener("mousedown", (e) => {
      if (this.state === "windowed") { this.bringToFront(); return; }
      // In maximized mode, only background clicks raise home — clicking text,
      // cards, links, or chrome controls leaves the z-stack alone so project
      // windows in front stay reachable.
      if (this.state !== "maximized") return;
      const t = e.target as HTMLElement;
      if (
        t === this.node ||
        t === this.pageEl ||
        t.matches(".container, .hero, .hero-right, .ventures-grid, .ventures-heading-wrap, .ventures-heading-rule")
      ) {
        this.bringToFront();
      }
    });
    // Initial z-index — participates in the shared z-stack from the start.
    WindowManager.zCounter += 1;
    this.node.style.zIndex = String(WindowManager.zCounter);
  }

  private wireTrafficLights() {
    const close = this.node.querySelector<HTMLButtonElement>('[data-act="home-close"]');
    const minimize = this.node.querySelector<HTMLButtonElement>('[data-act="home-minimize"]');
    const maximize = this.node.querySelector<HTMLButtonElement>('[data-act="home-maximize"]');
    close?.addEventListener("click", (e) => { e.stopPropagation(); this.close(); });
    minimize?.addEventListener("click", (e) => { e.stopPropagation(); this.minimize(); });
    maximize?.addEventListener("click", (e) => { e.stopPropagation(); this.toggleMaximize(); });
  }

  private wireDrag() {
    let startX = 0, startY = 0;
    makeDraggable({
      handle: this.tabsRow,
      isEnabled: () => this.state === "windowed",
      onStart: () => {
        startX = this.windowedX;
        startY = this.windowedY;
        this.node.classList.add("dragging");
        this.bringToFront();
      },
      onMove: (dx, dy) => {
        this.windowedX = startX + dx;
        this.windowedY = startY + dy;
        this.applyWindowedPos();
      },
      onEnd: () => {
        this.node.classList.remove("dragging");
      },
    });
  }

  private applyWindowedPos() {
    this.node.style.setProperty("--home-x", `${this.windowedX}px`);
    this.node.style.setProperty("--home-y", `${this.windowedY}px`);
  }

  private setState(s: HomeState) {
    document.body.classList.remove("home-maximized", "home-windowed", "home-minimized", "home-closed");
    document.body.classList.add(`home-${s}`);
    this.state = s;
    Desktop.setShortcutVisible(s !== "maximized");
  }

  bringToFront() {
    WindowManager.zCounter += 1;
    this.node.style.zIndex = String(WindowManager.zCounter);
    TabBar.setActive("home");
  }

  toggleMaximize() {
    if (this.state !== "maximized" && this.state !== "windowed") return;
    if (this.state === "windowed") {
      this.setState("maximized");
    } else {
      this.windowedX = 0;
      this.windowedY = 0;
      this.applyWindowedPos();
      this.setState("windowed");
    }
    this.bringToFront();
  }

  minimize() {
    if (this.state !== "maximized" && this.state !== "windowed") return;
    this.preserved = {
      windowState: this.state,
      scrollY: this.state === "windowed" ? this.pageEl.scrollTop : window.scrollY,
      windowedX: this.windowedX,
      windowedY: this.windowedY,
    };
    this.node.classList.add("is-home-minimizing");
    const done = () => {
      this.node.classList.remove("is-home-minimizing");
      this.setState("minimized");
    };
    this.node.addEventListener("animationend", done, { once: true });
  }

  close() {
    if (this.state === "closed") return;
    this.preserved = null;
    const projectKeys = [
      ...Array.from(WindowManager.openWindows.keys()),
      ...Array.from(WindowManager.minimized.keys()),
    ];
    for (const key of projectKeys) {
      const w = WindowManager.openWindows.get(key) ?? WindowManager.minimized.get(key);
      w?.node.classList.add("is-closing");
    }
    this.node.classList.add("is-home-closing");
    const done = () => {
      this.node.classList.remove("is-home-closing");
      for (const key of projectKeys) {
        const open = WindowManager.openWindows.get(key);
        const mini = WindowManager.minimized.get(key);
        if (open) { open.node.remove(); WindowManager.openWindows.delete(key); }
        if (mini) { mini.node.remove(); WindowManager.minimized.delete(key); }
        TabBar.removeProjectTab(key);
      }
      TabBar.setActive("home");
      this.setState("closed");
    };
    this.node.addEventListener("animationend", done, { once: true });
  }

  restore() {
    if (this.state !== "minimized" && this.state !== "closed") return;
    const preserved = this.preserved;
    this.preserved = null;

    // Restoring from the desktop shortcut always lands in windowed mode —
    // never maximized — so the Win7 wallpaper stays visible behind it.
    this.windowedX = preserved?.windowedX ?? 0;
    this.windowedY = preserved?.windowedY ?? 0;
    this.applyWindowedPos();
    this.setState("windowed");
    const scrollY = preserved?.scrollY ?? 0;
    requestAnimationFrame(() => this.pageEl.scrollTo(0, scrollY));

    this.bringToFront();
    this.node.classList.add("is-home-restoring");
    this.node.addEventListener("animationend", () => {
      this.node.classList.remove("is-home-restoring");
    }, { once: true });
  }
}

function isLightboxOpen(): boolean {
  return !!document.querySelector(".lightbox.is-open");
}

export function initModal() {
  homeWindow = new HomeWindow();
  Desktop.init(() => homeWindow.restore());

  TabBar.init();

  document
    .querySelectorAll<HTMLElement>(".venture-card[data-project]")
    .forEach((card) => {
      card.addEventListener("click", () => {
        const key = card.dataset.project;
        if (key) WindowManager.open(key, card);
      });
    });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isLightboxOpen()) return; // lightbox handles its own Esc
    if (WindowManager.openWindows.size === 0) return;
    let top: BrowserWindow | null = null;
    let topZ = -Infinity;
    for (const w of WindowManager.openWindows.values()) {
      const z = parseInt(w.node.style.zIndex || "0", 10);
      if (z > topZ) { topZ = z; top = w; }
    }
    if (top) WindowManager.close(top.key);
  });
}
