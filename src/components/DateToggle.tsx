import React from 'react';
import { useFileStore } from '../store/useFileStore';

export const DateToggle = React.memo(function DateToggle() {
  const dateMode = useFileStore((s) => s.dateMode);
  const setDateMode = useFileStore((s) => s.setDateMode);

  return (
    <div className="date-toggle">
      <span className={`date-toggle-label ${dateMode === 'modified' ? 'date-toggle-label--active' : ''}`}>
        Modified Date
      </span>
      <button
        className="toggle-switch"
        onClick={() => setDateMode(dateMode === 'modified' ? 'created' : 'modified')}
        aria-label="Toggle date mode"
      >
        <span
          className="toggle-knob"
          style={{ transform: dateMode === 'created' ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
      <span className={`date-toggle-label ${dateMode === 'created' ? 'date-toggle-label--active' : ''}`}>
        Created Date
      </span>
    </div>
  );
});
