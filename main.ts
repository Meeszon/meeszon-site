import { initViewer } from './viewer';

const viewerEl = document.getElementById('viewer')!;
initViewer(viewerEl);

const waveIcon = document.querySelector<SVGElement>('.wave-icon')!;
waveIcon.addEventListener('click', () => {
  waveIcon.classList.remove('waving');
  void waveIcon.offsetWidth;
  waveIcon.classList.add('waving');
});
waveIcon.addEventListener('animationend', () => {
  waveIcon.classList.remove('waving');
});

// Project modal
const backdrop = document.getElementById('modal-backdrop')!;
const modalProjectName = document.getElementById('modal-project-name')!;
const modalBody = document.getElementById('modal-body')!;
const modalClose = document.getElementById('modal-close')!;

const projectContent: Record<string, { name: string; body: string }> = {
  qarry: {
    name: 'Qarry',
    body: '<p>Project content goes here.</p>',
  },
};

function openModal(project: string) {
  const data = projectContent[project];
  if (!data) return;
  modalProjectName.textContent = data.name;
  modalBody.innerHTML = data.body;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll<HTMLElement>('.venture-card[data-project]').forEach((card) => {
  card.addEventListener('click', () => openModal(card.dataset.project!));
});

modalClose.addEventListener('click', closeModal);
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
