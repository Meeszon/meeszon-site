import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  AmbientLight,
  TextureLoader,
  Texture,
  DoubleSide,
  SRGBColorSpace,
} from "three";

const FPS = 60;
const SIZE = 112;
const ROTATE_BOUND = 20;
const PUPIL_BOUND = 15;
const PREFIX = "mees";
const X_STEPS = 20;
const Y_STEPS = 20;
const DISPLACEMENT_SCALE = 0.5;
const PRECISION = 10;

function round(value: number, precision: number) {
  return Math.round(value * precision) / precision;
}

const steps = Array.from({ length: Y_STEPS }, (_, y) =>
  Array.from({ length: X_STEPS }, (_, x) => {
    const index = y * X_STEPS + x;
    const rotate_yaw = round(
      ROTATE_BOUND * 2 * (x / (X_STEPS - 1)) - ROTATE_BOUND,
      PRECISION,
    );
    const rotate_pitch = round(
      ROTATE_BOUND * 2 * (y / (Y_STEPS - 1)) - ROTATE_BOUND,
      PRECISION,
    );
    const pupil_x = round(
      PUPIL_BOUND * 2 * (x / (X_STEPS - 1)) - PUPIL_BOUND,
      PRECISION,
    );
    const pupil_y = round(
      (PUPIL_BOUND * 2 * (y / (Y_STEPS - 1)) - PUPIL_BOUND) * -1,
      PRECISION,
    );
    const filename = `${PREFIX}_${String(index).padStart(3, "0")}_${x}_${y}_yaw${rotate_yaw}_pitch${rotate_pitch}_px${pupil_x}_py${pupil_y}.webp`;
    return { x, y, filename };
  }),
);

const allSteps = steps.flat();

export function initViewer(container: HTMLElement) {
  const canvas = document.createElement("canvas");
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.01, 10);
  camera.position.z = 2;
  scene.add(camera);

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(window.devicePixelRatio);

  scene.add(new AmbientLight(0xffffff, 2));

  const material = new MeshStandardMaterial({
    side: DoubleSide,
    displacementScale: DISPLACEMENT_SCALE,
  });

  const geometry = new PlaneGeometry(1.08, 1.08, 256, 256);
  scene.add(new Mesh(geometry, material));

  renderer.setAnimationLoop(() => renderer.render(scene, camera));

  container.appendChild(canvas);

  const textureLoader = new TextureLoader();
  const photoTextures = new Map<string, Texture>();
  const depthTextures = new Map<string, Texture>();

  function applyTextures(filename: string) {
    const tex = photoTextures.get(filename);
    if (!tex) return;
    material.map = tex;
    material.displacementMap = depthTextures.get(filename) ?? null;
    material.needsUpdate = true;
  }

  function loadStep(step: { filename: string }): Promise<void> {
    return new Promise<void>((resolve) => {
      textureLoader.load(
        `/outputs/${PREFIX}/${step.filename}`,
        (tex) => {
          tex.colorSpace = SRGBColorSpace;
          photoTextures.set(step.filename, tex);
          textureLoader.load(
            `/outputs/${PREFIX}/depth/${step.filename}.depth.png`,
            (depth) => {
              depthTextures.set(step.filename, depth);
              resolve();
            },
            undefined,
            () => resolve(),
          );
        },
        undefined,
        () => resolve(),
      );
    });
  }

  async function preload() {
    // Load and display the center frame immediately
    const cx = Math.floor(X_STEPS / 2);
    const cy = Math.floor(Y_STEPS / 2);
    const centerStep = steps[cy][cx];
    await loadStep(centerStep);
    applyTextures(centerStep.filename);

    // Load the rest in the background
    const rest = allSteps.filter((s) => s.filename !== centerStep.filename);
    const batchSize = 10;
    for (let i = 0; i < rest.length; i += batchSize) {
      await Promise.all(rest.slice(i, i + batchSize).map(loadStep));
    }
  }

  preload();

  // Mouse tracking — relative to portrait center
  let lastFrameTime = 0;
  let currentX = Math.floor(X_STEPS / 2);
  let currentY = Math.floor(Y_STEPS / 2);

  document.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastFrameTime < 1000 / FPS) return;
    lastFrameTime = now;

    const rect = container.getBoundingClientRect();
    const portraitCX = rect.left + rect.width / 2;
    const portraitCY = rect.top + rect.height / 2;

    const nx = Math.max(
      -1,
      Math.min(1, (e.clientX - portraitCX) / (window.innerWidth / 2)),
    );
    const ny = Math.max(
      -1,
      Math.min(1, (e.clientY - portraitCY) / (window.innerHeight / 2)),
    );

    const xIndex = Math.round(((nx + 1) / 2) * (X_STEPS - 1));
    const yIndex = Math.round(((ny + 1) / 2) * (Y_STEPS - 1));

    if (xIndex !== currentX || yIndex !== currentY) {
      currentX = xIndex;
      currentY = yIndex;
      applyTextures(steps[yIndex][xIndex].filename);
    }
  });
}
