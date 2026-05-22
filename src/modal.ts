/* ── Mees Portfolio · Browser window modal + Chrome tab bar ────────────
   - Each project card click opens a draggable browser-window modal.
   - Multiple windows can coexist; each one has a tab in the chrome bar.
   - Tabs also serve as the dock: minimize flies the window into its tab,
     restore flies it back out.
   ─────────────────────────────────────────────────────────────────────── */

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
    tools: ["Figma", "React", "Tailwind", "Laravel"],
    description:
      "A fully deployed fleet management dashboard for Qarry. Features real-time fleet tracking, detailed individual vehicle telemetry (trip history, battery, speed, etc.), and high-level data insights for in-house teams and customers.",
    descriptionLink: { text: "Qarry", href: "https://qarry.com" },
    gallery: [
      "/images/qarryshowcase/0.png",
      "/images/qarryshowcase/1.png",
      "/images/qarryshowcase/2.png",
      "/images/qarryshowcase/3.png",
      "/images/qarryshowcase/4.png",
      "/images/qarryshowcase/5.png",
      "/images/qarryshowcase/6.png",
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

let windowsLayer: HTMLElement;

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
    for (const key of Array.from(WindowManager.openWindows.keys())) {
      WindowManager.minimize(key);
    }
    this.setActive("home");
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
    windowsLayer.appendChild(this.node);
    this.setupDrag();
    this.setupCarousel();

    WindowManager.zCounter += 1;
    this.node.style.zIndex = String(WindowManager.zCounter);
    this.animateOpen();
  }

  private build(): HTMLElement {
    const d = this.data;
    const node = document.createElement("div");
    node.className = "win";
    node.dataset.key = this.key;

    const slides = (d.gallery || []).map((src, i) =>
      `<div class="win-carousel-slide">
        <img ${i === 0 ? `src="${src}"` : `data-src="${src}"`} alt="Screenshot ${i + 1}" draggable="false" />
      </div>`
    ).join("");

    const dots = (d.gallery || []).map((_, i) =>
      `<button class="modal-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join("");

    const carouselHTML = (d.gallery && d.gallery.length)
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
      <div class="win-body">
        <div class="win-content">
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
    let startMouseX = 0, startMouseY = 0, startX = 0, startY = 0;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = (e as MouseEvent).clientX ?? ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientX);
      const cy = (e as MouseEvent).clientY ?? ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientY);
      if (cx == null) return;
      this.x = startX + (cx - startMouseX);
      this.y = startY + (cy - startMouseY);
      this.applyPosition();
    };
    const onUp = () => {
      this.isDragging = false;
      this.node.classList.remove("dragging");
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove as EventListener);
      window.removeEventListener("touchend", onUp);
    };
    const onDown = (e: MouseEvent | TouchEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const cx = (e as MouseEvent).clientX ?? ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientX);
      const cy = (e as MouseEvent).clientY ?? ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientY);
      if (cx == null) return;
      startMouseX = cx;
      startMouseY = cy;
      startX = this.x;
      startY = this.y;
      this.isDragging = true;
      this.node.classList.add("dragging");
      WindowManager.focus(this.key);
      window.addEventListener("mousemove", onMove as EventListener);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove as EventListener, { passive: true });
      window.addEventListener("touchend", onUp);
      if (e.cancelable) e.preventDefault();
    };
    titlebar.addEventListener("mousedown", onDown as EventListener);
    titlebar.addEventListener("touchstart", onDown as EventListener, { passive: false });
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
      const w = Math.min(window.innerWidth - 24, 1100);
      const h = window.innerHeight - 24;
      this.node.style.width = `${w}px`;
      this.node.style.height = `${h}px`;
      this.x = 0; this.y = 0;
      this.applyPosition();
      this.node.dataset.maxed = "1";
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

function isLightboxOpen(): boolean {
  return !!document.querySelector(".lightbox.is-open");
}

export function initModal() {
  windowsLayer = document.getElementById("windows-layer")!;

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
