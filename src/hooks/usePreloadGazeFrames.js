import { useEffect } from 'react';
import { P_MIN, P_MAX, STEP, gridToFilename } from './useGazeTracking';

function gridValues() {
  const count = Math.round((P_MAX - P_MIN) / STEP) + 1;
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = P_MIN + i * STEP;
  return out;
}

export default function usePreloadGazeFrames(basePath = '/faces/') {
  useEffect(() => {
    if (navigator.connection?.saveData) return;

    const values = gridValues();
    const cells = [];
    for (const px of values) {
      for (const py of values) {
        cells.push({ px, py, dist: Math.max(Math.abs(px), Math.abs(py)) });
      }
    }
    cells.sort((a, b) => a.dist - b.dist);

    const hasIdle = typeof window.requestIdleCallback === 'function';
    const schedule = hasIdle
      ? (fn) => window.requestIdleCallback(fn, { timeout: 1000 })
      : (fn) => window.setTimeout(fn, 0);
    const cancel = hasIdle
      ? (h) => window.cancelIdleCallback?.(h)
      : (h) => window.clearTimeout(h);

    let cancelled = false;
    const preloaded = [];
    const handle = schedule(() => {
      if (cancelled) return;
      for (const { px, py } of cells) {
        const img = new Image();
        img.src = `${basePath}${gridToFilename(px, py)}`;
        preloaded.push(img);
      }
    });

    return () => {
      cancelled = true;
      cancel(handle);
    };
  }, [basePath]);
}
