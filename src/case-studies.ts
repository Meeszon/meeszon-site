/* ── Long-form case studies ───────────────────────────────────────────
   One entry per project key. Each entry is a function returning the
   inner HTML of the window body. When a case study exists for a
   project, BrowserWindow renders this instead of the short meta + carousel
   block.
   ──────────────────────────────────────────────────────────────────── */

const QIMG = "/images/qarryshowcase";
const MIMG = "/images/mrrshowcase";
const VIMG = "/images/volumeshowcase";

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

interface VideoFrameOpts {
  src: string;
  ratio: string; // intrinsic aspect ratio, e.g. "1580 / 860", to reserve space
  caption?: string;
  label?: string;
}

// A screen recording. The <video> carries its source in data-src and is only
// fetched/played once it scrolls into the window viewport (see
// BrowserWindow.setupCaseStudy). preload="none" keeps it off the wire until
// then; the aspect-ratio box reserves layout so nothing shifts on load.
function videoFrame({ src, ratio, caption, label }: VideoFrameOpts) {
  return `
    <figure class="cs-screen cs-video">
      <div class="cs-screen-frame">
        ${label ? `<span class="cs-screen-label">${label}</span>` : ""}
        <div class="cs-video-shell" style="aspect-ratio: ${ratio};">
          <video class="cs-video-el" data-src="${src}" muted loop playsinline preload="none" disablepictureinpicture></video>
        </div>
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
    ${screenFrame({
      img: `${QIMG}/0.webp`,
      alt: "Qarry delivery vehicle",
      caption: "// the qarry. compact, electric, Helmond-built. last-mile cargo.",
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
  </section>

  <section class="cs-section" id="cs-q-process">
    ${sectionHead("03", "Design Process")}
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
    <p class="cs-aside">// wireframe iterations → brand applied</p>
    <ol class="cs-iterations">
      <li class="cs-iter">
        <div class="cs-iter-card">
          <span class="cs-iter-tag">v1</span>
          <div class="cs-iter-thumb">
            <img src="${QIMG}/design-list.webp" alt="List view exploration" loading="lazy" draggable="false" />
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
            <img src="${QIMG}/design-maplist.webp" alt="List on map exploration" loading="lazy" draggable="false" />
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
            <img src="${QIMG}/design-highfidelity.webp" alt="High-fidelity shipped design" loading="lazy" draggable="false" />
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
      img: `${QIMG}/2.webp`,
      alt: "Fleet overview",
      caption: "// fleet overview. Every vehicle pinned on the map, list on the left. Each row expands to show battery, range and charging state without leaving the view.",
    })}

    ${screenFrame({
      img: `${QIMG}/4.webp`,
      alt: "Trip history view",
      caption: "// trip history. Click a trip and the route draws on the map; the timeline below shows when the vehicle was moving and when it was parked.",
    })}

    ${screenFrame({
      img: `${QIMG}/5.webp`,
      alt: "Diagnostics view",
      caption: "// diagnostics. The forty-five data points, charted per trip: state of charge, speed, cell temps, motor temp. Gated to Qarry's in-house teams.",
    })}

    ${screenFrame({
      img: `${QIMG}/6.webp`,
      alt: "Analytics dashboard",
      caption: "// analytics. Per-fleet rollups: total distance, idle vs. driving time, kilometres per day. The cross-fleet view sits one click deeper, in-house only.",
    })}

    ${screenFrame({
      img: `${QIMG}/vehicledrawing.webp`,
      alt: "Vehicle drawing viewer",
      caption: "// info pages. Beyond the live data, each vehicle has its own info pages. Shown here: the drawing viewer, where customers can browse the parts and specs of their Qarry.",
    })}

    <p class="cs-aside">// the application is responsive · same product, smaller screen:</p>
    <div class="cs-phone-row">
      <figure class="cs-phone">
        <div class="cs-phone-frame">
          <div class="cs-phone-notch" aria-hidden="true"></div>
          <div class="cs-phone-screen">
            <img src="${QIMG}/mobile1.webp" alt="Mobile fleet view" loading="lazy" draggable="false" />
          </div>
          <div class="cs-phone-home" aria-hidden="true"></div>
        </div>
        <figcaption class="cs-caption">// responsive · fleet view</figcaption>
      </figure>
      <figure class="cs-phone">
        <div class="cs-phone-frame">
          <div class="cs-phone-notch" aria-hidden="true"></div>
          <div class="cs-phone-screen">
            <img src="${QIMG}/mobile2.webp" alt="Mobile vehicle detail" loading="lazy" draggable="false" />
          </div>
          <div class="cs-phone-home" aria-hidden="true"></div>
        </div>
        <figcaption class="cs-caption">// responsive · vehicle detail</figcaption>
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

function mrr(): string {
  return `
<div class="case-study" data-project="mrr">

  <nav class="cs-toc" aria-label="Sections">
    <span class="cs-toc-prefix">// jump</span>
    <a href="#cs-m-overview" data-cs-jump>01 overview</a>
    <a href="#cs-m-research" data-cs-jump>02 research</a>
    <a href="#cs-m-process" data-cs-jump>03 process</a>
    <a href="#cs-m-screens" data-cs-jump>04 before / after</a>
    <a href="#cs-m-stack" data-cs-jump>05 stack</a>
    <span class="cs-toc-spacer"></span>
    <span class="cs-toc-readtime">~ 4 min</span>
  </nav>

  <header class="cs-hero cs-hero--compact">
    <h1 class="cs-hero-h1">A customer-facing redesign for MRR Drones.</h1>
    <div class="cs-hero-facts">
      <span class="cs-fact"><span class="cs-fact-key">role</span> Designer &amp; Developer</span>
      <span class="cs-fact-sep" aria-hidden="true">·</span>
      <span class="cs-fact"><span class="cs-fact-key">timeline</span> Feb 2026 – Present</span>
      <span class="cs-fact-sep" aria-hidden="true">·</span>
      <span class="cs-fact"><span class="cs-fact-key">product</span> Web Application</span>
      <span class="cs-fact-sep cs-fact-sep--client" aria-hidden="true">·</span>
      <span class="cs-fact cs-fact--client"><span class="cs-fact-key">client</span> <span class="cs-fact-val"><a href="https://multirotorresearch.com/" target="_blank" rel="noopener">MRR Drones</a></span></span>
    </div>
  </header>

  <!-- 01 OVERVIEW -->
  <section class="cs-section" id="cs-m-overview">
    ${sectionHead("01", "Overview")}
    <p class="cs-para">
      <a href="https://multirotorresearch.com/" target="_blank" rel="noopener">MRR Drones</a> makes software that flies DJI drones autonomously. You mark out an area, the app plans a flight, and the drone captures the photos used for a site's surveys and volume measurements.
    </p>
    <p class="cs-para">
      I'm running a full redesign of the customer-facing app, end to end: research, design and the front-end build.
    </p>
    <figure class="cs-cover">
      <div class="cs-cover-desk">
        <div class="mrr-shot-frame">
          <div class="mrr-shot-screen">
            <img src="${MIMG}/after-missioncreate.webp" alt="The redesigned MRR Drones mission planner on desktop" draggable="false" />
          </div>
        </div>
      </div>
      <div class="cs-cover-remote">
        <div class="mrr-remote">
          <img class="mrr-remote-bezel" src="${MIMG}/remote.webp" alt="DJI remote running the redesigned app" draggable="false" />
          <div class="mrr-remote-screen"><img src="${MIMG}/after-remotehome.webp" alt="" draggable="false" /></div>
        </div>
      </div>
    </figure>
  </section>

  <!-- 02 RESEARCH -->
  <section class="cs-section" id="cs-m-research">
    ${sectionHead("02", "Research")}
    <p class="cs-para">
      I start by understanding the actual users and what they need from the product. The users are practical, hands-on builders: surveyors and site crews, not technical operators. They need the easiest possible tool, with as little friction as the job allows.
    </p>
    <p class="cs-aside">// three findings shaped everything that came after</p>
    <ol class="cs-insights cs-insights--compact">
      <li>
        <span class="cs-insight-num">01</span>
        <div class="cs-insight-body">
          <strong>The remote is where the work happens.</strong>
          <span>The app was built desktop-first, with the remote as an afterthought. The reality is the opposite: most users build missions and start flights from the remote, in the field. </span>
        </div>
      </li>
      <li>
        <span class="cs-insight-num">02</span>
        <div class="cs-insight-body">
          <strong>It has to be obvious.</strong>
          <span>Big, clear targets and one obvious next step on every screen. No dead ends, no jargon, nothing that makes a non-technical user stop and wonder what to tap.</span>
        </div>
      </li>
      <li>
        <span class="cs-insight-num">03</span>
        <div class="cs-insight-body">
          <strong>Built for the conditions.</strong>
          <span>Used outdoors, on a construction site, on a small controller screen: bright sun, gloves, no time to fuss. High contrast, large hit areas, and as little typing as possible.</span>
        </div>
      </li>
    </ol>

    <p class="cs-aside">// the same product, two very different places</p>
    <div class="cs-audiences">
      <div class="cs-audience">
        <span class="cs-audience-tag">surface · 01</span>
        <strong>The remote · in the field</strong>
        <span class="cs-audience-scope">a small DJI controller, where missions get made and flights get started</span>
      </div>
      <div class="cs-audience-vs" aria-hidden="true">/</div>
      <div class="cs-audience">
        <span class="cs-audience-tag">surface · 02</span>
        <strong>The desktop · back at base</strong>
        <span class="cs-audience-scope">planning missions ahead, and reviewing captures after a flight</span>
      </div>
    </div>
  </section>

  <!-- 03 PROCESS -->
  <section class="cs-section" id="cs-m-process">
    ${sectionHead("03", "Design Process")}
    <p class="cs-para">
      Creating a mission is the hardest task in the app, and right now it's a single dense panel that's easy to get lost in. The design started from one idea: take that one complex task and split it into small steps a user can follow, one screen at a time.
    </p>

    <!-- 3a: the new-mission flow -->
    <div class="mrr-phase">
      <span class="mrr-phase-label"><span class="mrr-tag mrr-tag--before">before</span> one dense panel on the remote</span>
      <div class="mrr-remote-row mrr-remote-row--one">
        <figure class="mrr-remote-fig">
          <div class="mrr-remote">
            <img class="mrr-remote-bezel" src="${MIMG}/remote.webp" alt="DJI remote" draggable="false" />
            <div class="mrr-remote-screen"><img src="${MIMG}/before-remotemissioncreate.webp" alt="Old new-mission flow on the remote" loading="lazy" draggable="false" /></div>
          </div>
          <figcaption class="mrr-remote-cap">// the old screen squeezed the whole desktop panel onto the controller. Users do not know where to start.</figcaption>
        </figure>
      </div>
    </div>

    <div class="mrr-phase">
      <span class="mrr-phase-label"><span class="mrr-tag mrr-tag--idea">idea</span> break it into one decision per step</span>
      <div class="mrr-flow">
        <div class="mrr-flow-card">
          <div class="mrr-flow-screen s1" role="img" aria-label="Step 1 idea, set start and landing">
            <span class="mrr-flow-badge">01</span>
          </div>
          <span class="mrr-flow-cap"><b>set</b> start &amp; landing</span>
        </div>
        <span class="mrr-flow-arrow" aria-hidden="true">&rarr;</span>
        <div class="mrr-flow-card">
          <div class="mrr-flow-screen s2" role="img" aria-label="Step 2 idea, draw the flyzone">
            <span class="mrr-flow-badge">02</span>
          </div>
          <span class="mrr-flow-cap"><b>draw</b> the flyzone</span>
        </div>
        <span class="mrr-flow-arrow" aria-hidden="true">&rarr;</span>
        <div class="mrr-flow-card">
          <div class="mrr-flow-screen s3" role="img" aria-label="Step 3 idea, confirm settings">
            <span class="mrr-flow-badge">03</span>
          </div>
          <span class="mrr-flow-cap"><b>configure</b> settings</span>
        </div>
      </div>
    </div>

    <!-- 3b: the result, on the remote -->
    <p class="cs-aside" style="margin-top:26px;">// the result, on the remote</p>
    <p class="cs-para">
      The end result ended up being more complex than this original idea. But the core concept of breaking the task into steps with a logical flow for the user stayed the same.
    </p>
    <div class="mrr-phase">
      <span class="mrr-phase-label"><span class="mrr-tag mrr-tag--after">after</span> remote home · one job</span>
      <div class="mrr-remote-row mrr-remote-row--one">
        <figure class="mrr-remote-fig">
          <div class="mrr-remote">
            <img class="mrr-remote-bezel" src="${MIMG}/remote.webp" alt="DJI remote" draggable="false" />
            <div class="mrr-remote-screen"><img src="${MIMG}/after-remotehome.webp" alt="New remote home" loading="lazy" draggable="false" /></div>
          </div>
          <figcaption class="mrr-remote-cap">// the home page. a single obvious large Start Flight button, no confusion.</figcaption>
        </figure>
      </div>
    </div>
    <div class="mrr-remote-row mrr-remote-row--bare">
      <figure class="mrr-remote-fig">
        <div class="mrr-screenshot"><img src="${MIMG}/after-remotemissioncreate-map.webp" alt="Drawing the flyzone on the remote" loading="lazy" draggable="false" /></div>
        <figcaption class="mrr-remote-cap">// draw the flyzone</figcaption>
      </figure>
      <figure class="mrr-remote-fig">
        <div class="mrr-screenshot"><img src="${MIMG}/after-remotemissioncreate-settings.webp" alt="Capture settings on the remote" loading="lazy" draggable="false" /></div>
        <figcaption class="mrr-remote-cap">// configure the settings</figcaption>
      </figure>
      <figure class="mrr-remote-fig">
        <div class="mrr-screenshot"><img src="${MIMG}/after-remotestartflight.webp" alt="Start a flight on the remote" loading="lazy" draggable="false" /></div>
        <figcaption class="mrr-remote-cap">// start the flight</figcaption>
      </figure>
    </div>
  </section>

  <!-- 04 BEFORE & AFTER -->
  <section class="cs-section" id="cs-m-screens">
    ${sectionHead("04", "Before &amp; After")}
    <p class="cs-para">
      Back at base on the desktop, there were more improvements to be made. Each one below is the old screen beside the redesign.
    </p>

    <p class="cs-aside">// home</p>
    <div class="mrr-deskcompare">
      <figure class="mrr-shot">
        <div class="mrr-shot-frame">
          <span class="cs-screen-label">before</span>
          <div class="mrr-shot-screen">
            <img src="${MIMG}/before-home.webp" alt="Old desktop home, a full-screen map" loading="lazy" draggable="false" />
          </div>
        </div>
      </figure>
      <figure class="mrr-shot">
        <div class="mrr-shot-frame">
          <span class="cs-screen-label cs-screen-label--after">after</span>
          <div class="mrr-shot-screen">
            <img src="${MIMG}/after-home.webp" alt="New desktop home" loading="lazy" draggable="false" />
          </div>
        </div>
      </figure>
    </div>
    <p class="cs-caption">// The old home screen has no obvious purpose. The new design knows what the user wants to do and guides them to it.</p>

    <p class="cs-aside" style="margin-top:22px;">// create a mission</p>
    <div class="mrr-deskcompare">
      <figure class="mrr-shot">
        <div class="mrr-shot-frame">
          <span class="cs-screen-label">before</span>
          <div class="mrr-shot-screen">
            <img src="${MIMG}/before-missioncreate.webp" alt="Old create mission screen" loading="lazy" draggable="false" />
          </div>
        </div>
      </figure>
      <figure class="mrr-shot">
        <div class="mrr-shot-frame">
          <span class="cs-screen-label cs-screen-label--after">after</span>
          <div class="mrr-shot-screen">
            <img src="${MIMG}/after-missioncreate.webp" alt="New desktop mission planner" loading="lazy" draggable="false" />
          </div>
        </div>
      </figure>
    </div>
    <p class="cs-caption">// Biggest challenge here was guiding the user through the process with clear visual cues and feedback, so they know what to do at each step.</p>

    <p class="cs-aside" style="margin-top:22px;">// start a flight</p>
    <div class="mrr-deskcompare">
      <figure class="mrr-shot">
        <div class="mrr-shot-frame">
          <span class="cs-screen-label">before</span>
          <div class="mrr-shot-screen">
            <img src="${MIMG}/before-startmission.webp" alt="Old start mission screen" loading="lazy" draggable="false" />
          </div>
        </div>
      </figure>
      <figure class="mrr-shot">
        <div class="mrr-shot-frame">
          <span class="cs-screen-label cs-screen-label--after">after</span>
          <div class="mrr-shot-screen">
            <img src="${MIMG}/after-startflight.webp" alt="New start a flight screen" loading="lazy" draggable="false" />
          </div>
        </div>
      </figure>
    </div>
    <p class="cs-caption">// Providing a preview of the flight path on the map helps users know what flight they are about to start.</p>
  </section>

  <!-- 05 STACK -->
  <section class="cs-section" id="cs-m-stack">
    ${sectionHead("05", "How It Was Built")}
    <dl class="cs-stack-table">
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[01]</span> Figma</dt>
        <dd>Used for quick prototyping and visualising ideas rapidly: iterating and settling on a design with the stakeholders before implementing.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[02]</span> React</dt>
        <dd>Component-driven front-end. The remote and desktop layouts share the same components, branching only where the form factor demands it.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[03]</span> Tailwind</dt>
        <dd>Styling leaned heavily on Tailwind, with consistent style tokens to keep the design coherent across every page.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[04]</span> Performance</dt>
        <dd>The DJI controller is a modest Android device, so the front-end is tuned to stay smooth there: lean rendering, light map interactions, etc.</dd>
      </div>
    </dl>
  </section>

  <footer class="cs-footer">
    <span class="cs-footer-left">// case study in progress · mrr drones</span>
    <span class="cs-footer-spacer"></span>
    <span class="cs-footer-right">last updated 31 may 2026</span>
  </footer>

</div>
  `;
}

function volume(): string {
  return `
<div class="case-study" data-project="volume">

  <nav class="cs-toc" aria-label="Sections">
    <span class="cs-toc-prefix">// jump</span>
    <a href="#cs-v-overview" data-cs-jump>01 overview</a>
    <a href="#cs-v-skilltree" data-cs-jump>02 skill tree</a>
    <a href="#cs-v-schedule" data-cs-jump>03 schedule</a>
    <a href="#cs-v-stack" data-cs-jump>04 stack</a>
    <span class="cs-toc-spacer"></span>
    <span class="cs-toc-readtime">~ 2 min</span>
  </nav>

  <header class="cs-hero cs-hero--compact">
    <h1 class="cs-hero-h1">Volume: a training companion for boulderers.</h1>
    <div class="cs-hero-facts">
      <span class="cs-fact"><span class="cs-fact-key">role</span> Designer &amp; Developer</span>
      <span class="cs-fact-sep" aria-hidden="true">·</span>
      <span class="cs-fact"><span class="cs-fact-key">timeline</span> March 2026 – Present</span>
      <span class="cs-fact-sep" aria-hidden="true">·</span>
      <span class="cs-fact"><span class="cs-fact-key">product</span> Web Application</span>
      <span class="cs-fact-sep cs-fact-sep--client" aria-hidden="true">·</span>
      <span class="cs-fact cs-fact--client"><span class="cs-fact-key">type</span> <span class="cs-fact-val">Personal project</span></span>
    </div>
  </header>

  <!-- 01 OVERVIEW -->
  <section class="cs-section" id="cs-v-overview">
    ${sectionHead("01", "Overview")}
    <p class="cs-para">
      Volume is a personal project: a training guide and scheduler for boulderers. I built it as a playground for animation, drag-and-drop and a backend I could shape myself, and now use it to plan my own climbing.
    </p>
    <p class="cs-para">
      Pick the skills you want to improve, then build a week around them. Two pages carry the app: a <strong>skill tree</strong> to choose what to work on, and a <strong>schedule</strong> to put it into your week.
    </p>
  </section>

  <!-- 02 SKILL TREE -->
  <section class="cs-section" id="cs-v-skilltree">
    ${sectionHead("02", "The Skill Tree")}
    <p class="cs-para">
      Every boulderer has their own mix of strengths and weak spots: finger strength, footwork, slab, dynos, the mental game. The skill tree maps all of it. Open any node to read how to train it, then flag the ones you want to focus on. Those flagged skills become your goals.
    </p>
    ${videoFrame({
      src: `${VIMG}/skilltree.mp4`,
      ratio: "1580 / 860",
      caption: "// the skill tree. browse every skill, open one to read about it, and flag the ones you want to work on.",
    })}
  </section>

  <!-- 03 SCHEDULE -->
  <section class="cs-section" id="cs-v-schedule">
    ${sectionHead("03", "The Schedule")}
    <p class="cs-para">
      The schedule turns those goals into a plan. Drop a block into the week as a warmup, training block or climbing session, each one tied back to a skill you flagged, so the week stays pointed at what you want to improve.
    </p>
    ${videoFrame({
      src: `${VIMG}/schedule.mp4`,
      ratio: "1580 / 860",
      caption: "// the schedule. drag warmups, training blocks and sessions into the week; each one links back to a skill goal.",
    })}
  </section>

  <!-- 04 STACK -->
  <section class="cs-section" id="cs-v-stack">
    ${sectionHead("04", "How It Was Built")}
    <dl class="cs-stack-table">
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[01]</span> React</dt>
        <dd>Component-driven front end. The app has two main views — the skill tree and the schedule — built from a shared set of components.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[02]</span> TypeScript</dt>
        <dd>Typed throughout, so the data flowing between the tree, goals and schedule stays consistent as the app grows.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[03]</span> Vite</dt>
        <dd>Build tool and dev server. Fast local feedback and the production bundle.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[04]</span> CSS</dt>
        <dd>Scoped CSS Modules built on a shared set of design tokens, with the lower-level keyframe animations living here.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[05]</span> Supabase</dt>
        <dd>Backend and auth. A Postgres database holds the skill tree, goals and schedule, with Supabase handling the data layer and login.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[06]</span> Framer Motion</dt>
        <dd>The motion layer. Handles layout animations on the schedule and view transitions on the tree, so reordering and state changes animate smoothly instead of snapping.</dd>
      </div>
      <div class="cs-stack-row">
        <dt><span class="cs-stack-key">[07]</span> @hello-pangea/dnd</dt>
        <dd>Drag-and-drop on the schedule page and the timeline. A maintained fork of react-beautiful-dnd.</dd>
      </div>
    </dl>
  </section>

  <footer class="cs-footer">
    <span class="cs-footer-left">// case study in progress · volume</span>
    <span class="cs-footer-spacer"></span>
    <span class="cs-footer-right">last updated 31 may 2026</span>
  </footer>

</div>
  `;
}

export const caseStudies: Record<string, () => string> = {
  mrr,
  qarry,
  volume,
};
