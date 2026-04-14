import { useState, useEffect, useCallback, useRef } from 'react';

const P_MIN = -15;
const P_MAX = 15;
const STEP = 2.5;
const SIZE = 256;

function quantizeToGrid(val) {
  const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2;
  const snapped = Math.round(raw / STEP) * STEP;
  return Math.max(P_MIN, Math.min(P_MAX, snapped));
}

function gridToFilename(px, py) {
  // Python formats floats as "0.0", "5.0" etc. — must match that format.
  const sanitize = (val) => {
    const str = Number.isInteger(val) ? val.toFixed(1) : val.toString();
    return str.replace('-', 'm').replace('.', 'p');
  };
  return `gaze_px${sanitize(px)}_py${sanitize(py)}_${SIZE}.webp`;
}

export function useGazeTracking(containerRef, basePath = '/faces/') {
  const [currentImage, setCurrentImage] = useState(null);
  const rectRef = useRef(null);
  const lastImageRef = useRef(null);

  // Cache the container rect; only recompute on resize/scroll, not every mousemove.
  useEffect(() => {
    function updateRect() {
      if (containerRef.current) {
        rectRef.current = containerRef.current.getBoundingClientRect();
      }
    }
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [containerRef]);

  const updateGaze = useCallback((clientX, clientY) => {
    const rect = rectRef.current;
    if (!rect) return;

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
  }, [basePath]);

  useEffect(() => {
    const handleMouseMove = (e) => updateGaze(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) updateGaze(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (rectRef.current) {
      const { left, top, width, height } = rectRef.current;
      updateGaze(left + width / 2, top + height / 2);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [updateGaze]);

  return { currentImage };
}

export default useGazeTracking;
