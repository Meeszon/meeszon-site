import { useState, useEffect, useCallback, useRef } from 'react';

export const P_MIN = -15;
export const P_MAX = 15;
export const STEP = 2.5;
export const SIZE = 256;

function quantizeToGrid(val) {
  const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2;
  const snapped = Math.round(raw / STEP) * STEP;
  return Math.max(P_MIN, Math.min(P_MAX, snapped));
}

export function gridToFilename(px, py) {
  // Python formats floats as "0.0", "5.0" etc. — must match that format.
  const sanitize = (val) => {
    const str = Number.isInteger(val) ? val.toFixed(1) : val.toString();
    return str.replace('-', 'm').replace('.', 'p');
  };
  return `gaze_px${sanitize(px)}_py${sanitize(py)}_${SIZE}.webp`;
}

export function useGazeTracking(containerRef, basePath = '/faces/') {
  const [currentImage, setCurrentImage] = useState(null);
  const lastImageRef = useRef(null);

  // Read the container rect fresh on each move. Caching it (invalidated only on
  // resize/scroll) goes stale when the home window is closed and reopened —
  // restoring moves the portrait to a new on-screen position without firing
  // either event, so the gaze center would be computed from the old location.
  const updateGaze = useCallback((clientX, clientY) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const nx = (clientX - centerX) / (window.innerWidth / 2);
    // Y is negated because face_looker's py axis is inverted vs screen coords.
    // Looking up is more sensitive since the portrait is near the top of the page.
    const rawNy = -(clientY - centerY);
    const ny = rawNy > 0
      ? rawNy / (window.innerHeight / 4)
      : rawNy / (window.innerHeight / 2);

    const px = quantizeToGrid(Math.max(-1, Math.min(1, nx)));
    const py = quantizeToGrid(Math.max(-1, Math.min(1, ny)));

    const imagePath = `${basePath}${gridToFilename(px, py)}`;
    if (lastImageRef.current !== imagePath) {
      lastImageRef.current = imagePath;
      setCurrentImage(imagePath);
    }
  }, [basePath, containerRef]);

  useEffect(() => {
    // Coalesce pointer events into one updateGaze (and thus one layout read)
    // per animation frame instead of running on every move event.
    let frame = 0;
    let lastX = 0, lastY = 0;
    const schedule = (x, y) => {
      lastX = x; lastY = y;
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; updateGaze(lastX, lastY); });
    };
    const handleMouseMove = (e) => schedule(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) schedule(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      updateGaze(left + width / 2, top + height / 2);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [updateGaze, containerRef]);

  return { currentImage };
}

export default useGazeTracking;
