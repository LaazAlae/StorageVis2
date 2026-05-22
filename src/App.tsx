import React from 'react';
import { useFileStore } from './store/useFileStore';
import { LandingPage } from './components/LandingPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FolderTree } from './components/FolderTree';
import { Sidebar } from './components/Sidebar';
import { FileInspector } from './components/FileInspector';
import { Breadcrumbs } from './components/Breadcrumbs';
import { DateDecisionChart } from './components/DateDecisionChart';
import { Icon } from './components/Icons';
import { formatNumber, formatSize } from './utils/formatters';

export default function App() {
  const phase = useFileStore((s) => s.phase);
  const tree = useFileStore((s) => s.tree);
  const activeTab = useFileStore((s) => s.activeTab);
  const setActiveTab = useFileStore((s) => s.setActiveTab);
  const search = useFileStore((s) => s.search);
  const setSearch = useFileStore((s) => s.setSearch);

  if (phase === 'landing') return <LandingPage />;
  if (phase === 'loading') return <LoadingSpinner />;
  if (!tree) return null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">F</div>
          <span className="brand-name">File Inventory Explorer</span>
        </div>
        <div className="header-meta">
          <div className="dataset-pill">
            <span className="dot" />
            <span className="path">{tree.fullPath}</span>
            <span className="sep">{'\u00b7'}</span>
            <span className="size">{formatNumber(tree.recursiveFileCount)} files</span>
            <span className="sep">{'\u00b7'}</span>
            <span className="size">{formatSize(tree.recursiveSizeBytes)}</span>
          </div>
        </div>
        <div className="search">
          <span className="search-icon"><Icon.Search /></span>
          <input type="text" placeholder="Search folders and files\u2026" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </header>

      <Sidebar />

      <main className="main">
        <nav className="tabs">
          <button className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
            <Icon.Folder /> Folder Explorer
            <span className="tab-badge">{formatNumber(tree.children.length)}</span>
          </button>
          <button className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
            <Icon.Pie /> Charts
          </button>
        </nav>

        {activeTab === 0 ? (
          <>
            <div className="toolbar">
              <Breadcrumbs />
              <div className="toolbar-right">
                <button className="icon-btn" title="Reset view"><Icon.Maximize /></button>
              </div>
            </div>
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <FolderTree />
              <FileInspector />
            </div>
          </>
        ) : <DateDecisionChart />}
      </main>
    </div>
  );
}
