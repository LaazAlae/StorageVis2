import React from 'react';
import { useFileStore } from '../store/useFileStore';

const TABS = [
  'Folder Explorer',
  'Charts',
  'Migration Readiness',
  'Duplicates',
];

export const TabBar = React.memo(function TabBar() {
  const activeTab = useFileStore((s) => s.activeTab);
  const setActiveTab = useFileStore((s) => s.setActiveTab);

  return (
    <nav className="tab-bar">
      {TABS.map((label, i) => (
        <button
          key={label}
          className={`tab-button ${i === activeTab ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab(i)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
});
