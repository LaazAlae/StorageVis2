import React from 'react';
import { useFileStore } from '../store/useFileStore';

export const LoadingSpinner = React.memo(function LoadingSpinner() {
  const progress = useFileStore((s) => s.loadProgress);

  return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="loading-text">Processing CSV...</p>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="loading-percent">{progress}%</p>
    </div>
  );
});
