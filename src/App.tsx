import React from 'react';
import { useFileStore } from './store/useFileStore';
import { LandingPage } from './components/LandingPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TabBar } from './components/TabBar';
import { FolderExplorer } from './components/FolderExplorer';
import { PlaceholderView } from './components/PlaceholderView';

const TAB_VIEWS: React.FC[] = [
  () => <FolderExplorer />,
  () => <PlaceholderView title="Charts" />,
  () => <PlaceholderView title="Migration Readiness" />,
  () => <PlaceholderView title="Duplicates" />,
];

export default function App() {
  const phase = useFileStore((s) => s.phase);
  const activeTab = useFileStore((s) => s.activeTab);

  if (phase === 'landing') {
    return <LandingPage />;
  }

  if (phase === 'loading') {
    return <LoadingSpinner />;
  }

  const ActiveView = TAB_VIEWS[activeTab] ?? TAB_VIEWS[0];

  return (
    <div className="app-layout">
      <TabBar />
      <div className="app-content">
        <ActiveView />
      </div>
    </div>
  );
}
