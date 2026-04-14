import { useRef, useState } from 'react';
import useGazeTracking from '../hooks/useGazeTracking';
import './FaceTracker.css';

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  transition: 'opacity 0.1s ease-out',
};

export default function FaceTracker({ className = '', basePath = '/faces/', showDebug = false }) {
  const containerRef = useRef(null);
  const { currentImage } = useGazeTracking(containerRef, basePath);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div
      ref={containerRef}
      className={`face-tracker ${className}`}
      onMouseMove={showDebug ? (e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      } : undefined}
    >
      {currentImage && (
        <img src={currentImage} alt="Face following gaze" className="face-image" style={imageStyle} />
      )}
      {showDebug && (
        <div className="face-debug">
          <div>Mouse: ({Math.round(mousePos.x)}, {Math.round(mousePos.y)})</div>
          <div>Image: {currentImage?.split('/').pop()}</div>
        </div>
      )}
    </div>
  );
}
