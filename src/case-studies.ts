/* ── Long-form case studies ───────────────────────────────────────────
   One entry per project key. Each entry is a function returning the
   inner HTML of the window body. When a case study exists for a
   project, BrowserWindow renders this instead of the short meta + carousel
   block.
   ──────────────────────────────────────────────────────────────────── */

const QIMG = "/images/qarryshowcase";

function sectionHead(num: string, title: string, sub?: string) {
  return `
    <div class="cs-section-head">
      <span class="cs-section-num">${num}</span>
      <span class="cs-section-title">${title}</span>
      <span class="cs-section-rule"></span>
      ${sub ? `<span class="cs-section-sub">${sub}</span>` : ""}
    </div>`;
}

interface ScreenFrameOpts {
  img: string;
  alt: string;
  caption?: string;
  label?: string;
}

function screenFrame({ img, alt, caption, label }: ScreenFrameOpts) {
  return `
    <figure class="cs-screen">
      <div class="cs-screen-frame">
        ${label ? `<span class="cs-screen-label">${label}</span>` : ""}
        <img src="${img}" alt="${alt}" loading="lazy" draggable="false" />
      </div>
      ${caption ? `<figcaption class="cs-caption">${caption}</figcaption>` : ""}
    </figure>`;
}

function qarry(): string {
  return `
<div class="case-study" data-project="qarry">

  <nav class="cs-toc" aria-label="Sections">
    <span class="cs-toc-prefix">// jump</span>
    <a href="#cs-q-overview" data-cs-jump>01 overview</a>
    <a href="#cs-q-problem" data-cs-jump>02 brief</a>
    <a href="#cs-q-process" data-cs-jump>03 process</a>
    <a href="#cs-q-screens" data-cs-jump>04 screens</a>
    <a href="#cs-q-stack" data-cs-jump>05 stack</a>
    <span class="cs-toc-spacer"></span>
    <span class="cs-toc-readtime">~ 4 min</span>
  </nav>

  <header class="cs-hero cs-hero--compact">
    <h1 class="cs-hero-h1">Fleet management application for Qarry.</h1>
    <div class="cs-hero-facts">
      <span class="cs-fact"><span class="cs-fact-key">role</span> Designer &amp; Developer</span>
      <span class="cs-fact-sep" aria-hidden="true">·</span>
      <span class="cs-fact"><span class="cs-fact-key">timeline</span> Jan – Jul 2025</span>
      <span class="cs-fact-sep" aria-hidden="true">·</span>
      <span class="cs-fact"><span class="cs-fact-key">product</span> Web Application</span>
      <span class="cs-fact-sep cs-fact-sep--client" aria-hidden="true">·</span>
      <span class="cs-fact cs-fact--client"><span class="cs-fact-key">client</span> <span class="cs-fact-val"><a href="https://qarry.com" target="_blank" rel="noopener">Qarry</a>, Helmond NL</span></span>
    </div>
  </header>

  <section class="cs-section" id="cs-q-overview">
    ${sectionHead("01", "Overview")}
    <p class="cs-para">
      <a href="https://qarry.com" target="_blank" rel="noopener">Qarry</a> builds compact electric last-mile vehicles in Helmond and leases them to fleet operators across the Netherlands. The new generation of vehicles ships with on-board telemetry, i was brought in to turn that data into a product.
    </p>
    <div class="cs-audiences">
      <div class="cs-audience">
        <span class="cs-audience-tag">audience · 01</span>
        <strong>Qarry's customers</strong>
        <span class="cs-audience-scope">fleet managers · see their vehicles, overview first</span>
      </div>
      <div class="cs-audience-vs" aria-hidden="true">/</div>
      <div class="cs-audience">
        <span class="cs-audience-tag">audience · 02</span>
        <strong>Qarry in-house teams</strong>
        <span class="cs-audience-scope">see every fleet, plus the deep telemetry behind each trip</span>
      </div>
    </div>
    ${screenFrame({
      img: `${QIMG}/0.png`,
      alt: "Qarry delivery vehicle",
      caption: "// fig 00 — the qarry. compact, electric, Helmond-built. last-mile cargo.",
      label: "qarry.com",
    })}
  </section>

  <section class="cs-section" id="cs-q-problem">
    ${sectionHead("02", "The Problem")}
    <p class="cs-para">
      The new vehicles came fitted with a telemetry unit on board: GPS, battery, speed, odometer, and more specific signals like cell temperatures and battery voltage usage. Around forty-five data points in total, streaming back constantly. The data existed. There was nowhere to read it, and two audiences who needed very different things out of it.
    </p>

    <div class="cs-beforeafter" aria-label="Input and output diagram">
      <div class="cs-ba-side cs-ba-side--before">
        <span class="cs-ba-label">// the input</span>
        <div class="cs-ba-tile">
          <span class="cs-ba-tile-key">[01]</span>
          <strong>Location &amp; motion</strong>
          <span class="cs-ba-tile-note">gps · speed · heading · odometer</span>
        </div>
        <div class="cs-ba-tile">
          <span class="cs-ba-tile-key">[02]</span>
          <strong>Battery &amp; range</strong>
          <span class="cs-ba-tile-note">state of charge · cell temperatures</span>
        </div>
        <div class="cs-ba-tile">
          <span class="cs-ba-tile-key">[03]</span>
          <strong>Drive signals</strong>
          <span class="cs-ba-tile-note">battery voltage usage · motor temp · faults</span>
        </div>
        <div class="cs-ba-handwork">
          <span class="cs-ba-handwork-icon" aria-hidden="true">~</span>
          ~45 data points · per vehicle
        </div>
      </div>
      <div class="cs-ba-arrow" aria-hidden="true">
        <span class="cs-ba-arrow-line"></span>
        <span class="cs-ba-arrow-head">→</span>
      </div>
      <div class="cs-ba-side cs-ba-side--after">
        <span class="cs-ba-label">// the output</span>
        <div class="cs-ba-tile cs-ba-tile--solo">
          <span class="cs-ba-tile-key">[01]</span>
          <strong>Qarry dashboard</strong>
          <ul class="cs-ba-features">
            <li>fleet overview · live map</li>
            <li>per-trip route &amp; battery history</li>
            <li>fleet analytics · idle vs. driving</li>
            <li>diagnostics &amp; cross-fleet roll-up · in-house only</li>
          </ul>
        </div>
      </div>
    </div>

    <blockquote class="cs-pullquote">
      <span class="cs-quote-mark" aria-hidden="true">"</span>
      <p>We get a lot of data off the vehicles already, but we aren't fully utilizing it. The telemetry is all there we just need a way to turn it into something our customers and our team can actually act on.</p>
      <footer>— Founder, kickoff interview</footer>
    </blockquote>

    <p class="cs-aside">// research · sessions with the Qarry team and customer fleet managers</p>
    <ol class="cs-insights cs-insights--compact">
      <li>
        <span class="cs-insight-num">01</span>
        <div class="cs-insight-body">
          <strong>Customers want the answer, not the data.</strong>
          <span>Where is my van, how much battery, where has it been. Quick fleet overview + range + route history first; the raw data stay hidden.</span>
        </div>
      </li>
      <li>
        <span class="cs-insight-num">02</span>
        <div class="cs-insight-body">
          <strong>In-house needs the depth.</strong>
          <span>Cell temps, battery voltage usage, motor signals: the data Qarry uses to learn the vehicles and get ahead of a problem before it becomes a service call.</span>
        </div>
      </li>
      <li>
        <span class="cs-insight-num">03</span>
        <div class="cs-insight-body">
          <strong>Idle time matters for delivery vans.</strong>
          <span>Fleet managers asked for a long-window dashboard: idle vs. driving, kilometres per day, per vehicle and per fleet. In-house gets the same view, layered across every customer.</span>
        </div>
      </li>
    </ol>
  </section>

  <section class="cs-section" id="cs-q-process">
    ${sectionHead("03", "Design Process")}
    <p class="cs-aside">// wireframe iterations → brand applied</p>
    <ol class="cs-iterations">
      <li class="cs-iter">
        <div class="cs-iter-card">
          <span class="cs-iter-tag">v1</span>
          <div class="cs-iter-thumb">
            <img src="${QIMG}/design-list.jpg" alt="List view exploration" loading="lazy" draggable="false" />
          </div>
        </div>
        <div class="cs-iter-meta">
          <span class="cs-iter-label">Initial Wireframes</span>
          <span class="cs-iter-note">List first concept. Fast to scan, but no sense of <em>where</em> any vehicle was.</span>
        </div>
      </li>
      <li class="cs-iter">
        <div class="cs-iter-card">
          <span class="cs-iter-tag">v2</span>
          <div class="cs-iter-thumb">
            <img src="${QIMG}/design-maplist.jpg" alt="List on map exploration" loading="lazy" draggable="false" />
          </div>
        </div>
        <div class="cs-iter-meta">
          <span class="cs-iter-label">Map + panel</span>
          <span class="cs-iter-note">Map alongside the list. Giving spatial context to the vehicles data.</span>
        </div>
      </li>
      <li class="cs-iter cs-iter-shipped">
        <div class="cs-iter-card">
          <span class="cs-iter-tag cs-iter-tag--shipped">v3 ★</span>
          <div class="cs-iter-thumb">
            <img src="${QIMG}/design-highfidelity.jpg" alt="High-fidelity shipped design" loading="lazy" draggable="false" />
          </div>
        </div>
        <div class="cs-iter-meta">
          <span class="cs-iter-label">Visual design</span>
          <span class="cs-iter-note">Locked layout with the Qarry brand: real type, colours, components.</span>
        </div>
      </li>
    </ol>
  </section>

  <section class="cs-section" id="cs-q-screens">
    ${sectionHead("04", "Key Screens")}

    ${screenFrame({
      img: `${QIMG}/2.png`,
      alt: "Fleet overview",
      caption: "// fig 01 — fleet overview. Every vehicle pinned on the map, list on the left. Each row expands to show battery, range and charging state without leaving the view.",
    })}

    ${screenFrame({
      img: `${QIMG}/4.png`,
      alt: "Trip history view",
      caption: "// fig 02 — trip history. Click a trip and the route draws on the map; the timeline below shows when the vehicle was moving and when it was parked.",
    })}

    ${screenFrame({
      img: `${QIMG}/5.png`,
      alt: "Diagnostics view",
      caption: "// fig 03 — diagnostics. The forty-five data points, charted per trip: state of charge, speed, cell temps, motor temp. Gated to Qarry's in-house teams.",
    })}

    ${screenFrame({
      img: `${QIMG}/6.png`,
      alt: "Analytics dashboard",
      caption: "// fig 04 — analytics. Per-fleet rollups: total distance, idle vs. driving time, kilometres per day. The cross-fleet view sits one click deeper, in-house only.",
    })}

    ${screenFrame({
      img: `${QIMG}/vehicledrawing.png`,
      alt: "Vehicle drawing viewer",
      caption: "// fig 05 — info pages. Beyond the live data, each vehicle has its own info pages. Shown here: the drawing viewer, where customers can browse the parts and specs of their Qarry.",
    })}

    <p class="cs-aside">// the application is responsive · same product, smaller screen:</p>
    <div class="cs-phone-row">
      <figure class="cs-phone">
        <div class="cs-phone-frame">
          <div class="cs-phone-notch" aria-hidden="true"></div>
          <div class="cs-phone-screen">
            <img src="${QIMG}/mobile1.png" alt="Mobile fleet view" loading="lazy" draggable="false" />
          </div>
          <div class="cs-phone-home" aria-hidden="true"></div>
        </div>
        <figcaption class="cs-caption">// fig 06 — responsive · fleet view</figcaption>
      </figure>
      <figure class="cs-phone">
        <div class="cs-phone-frame">
          <div class="cs-phone-notch" aria-hidden="true"></div>
          <div class="cs-phone-screen">
            <img src="${QIMG}/mobile2.png" alt="Mobile vehicle detail" loading="lazy" draggable="false" />
          </div>
          <div class="cs-phone-home" aria-hidden="true"></div>
        </div>
        <figcaption class="cs-caption">// fig 07 — responsive · vehicle detail</figcaption>
      </figure>
    </div>
  </section>

  <section class="cs-section" id="cs-q-stack">
    ${sectionHead("05", "How It Was Built")}
    <dl class="cs-stack-table">
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[01]</span> Figma</dt>
        <dd>Where the whole product was designed. Low-fi explorations, the high-fidelity screens, and the design system.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[02]</span> React + Tailwind</dt>
        <dd>Component-driven UI with utility-first styling. Fast to compose, easy to keep consistent across screens, and a familiar pairing for whoever maintains the codebase next.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[03]</span> Shadcn</dt>
        <dd>Base components: buttons, dialogs, tables, popovers. Re-themed against the Qarry brand tokens.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[04]</span> Laravel + Inertia</dt>
        <dd>Backend and routing. Laravel handles the data and role logic; Inertia bridges it to the React views without a separate API layer.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[05]</span> Leaflet + OpenStreetMap</dt>
        <dd>The map layer: vehicle markers, route trails, etc. Intuitive map controls.</dd>
      </div>
    </dl>
  </section>

  <footer class="cs-footer">
    <span class="cs-footer-left">// end of case study · qarry</span>
    <span class="cs-footer-spacer"></span>
    <span class="cs-footer-right">last updated 22 may 2026</span>
  </footer>

</div>
  `;
}

export const caseStudies: Record<string, () => string> = {
  qarry,
};
