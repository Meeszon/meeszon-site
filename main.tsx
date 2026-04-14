import { createRoot } from 'react-dom/client';
import FaceTracker from './src/components/FaceTracker';
import { initModal } from './src/modal';

createRoot(document.getElementById("viewer")!).render(
  <FaceTracker basePath="/faces/" />
);

const waveIcon = document.querySelector<HTMLElement>(".wave-icon")!;
function triggerWave() {
  waveIcon.classList.remove("waving");
  void waveIcon.offsetWidth;
  waveIcon.classList.add("waving");
}

let waveHoverTimer: ReturnType<typeof setTimeout> | null = null;

waveIcon.addEventListener("mouseenter", () => {
  waveHoverTimer = setTimeout(triggerWave, 150);
});
waveIcon.addEventListener("mouseleave", () => {
  if (waveHoverTimer) { clearTimeout(waveHoverTimer); waveHoverTimer = null; }
});
waveIcon.addEventListener("click", triggerWave);
waveIcon.addEventListener("animationend", () => {
  waveIcon.classList.remove("waving");
});

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

initModal();
