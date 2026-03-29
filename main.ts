import { initViewer } from './viewer';

const viewerEl = document.getElementById('viewer')!;
initViewer(viewerEl);

const waveIcon = document.querySelector<SVGElement>('.wave-icon')!;
waveIcon.addEventListener('click', () => {
  waveIcon.classList.remove('waving');
  void waveIcon.offsetWidth; // force reflow so re-clicks restart the animation
  waveIcon.classList.add('waving');
});
waveIcon.addEventListener('animationend', () => {
  waveIcon.classList.remove('waving');
});
