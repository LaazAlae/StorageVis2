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
          <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
            <defs>
              <linearGradient id="brandGradient" x1="7" y1="5" x2="41" y2="43" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" />
                <stop offset="0.5" stopColor="#2563eb" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="38" height="38" rx="12" fill="url(#brandGradient)" />
            <path d="M15 18.5c0-2.2 1.8-4 4-4h8.3c1.2 0 2.3.5 3.1 1.4l2.6 2.9h-9.6c-2.2 0-4 1.8-4 4v10.7H15V18.5Z" fill="white" opacity="0.96" />
            <path d="M21 24.3c0-1.7 1.4-3.1 3.1-3.1H35c1.7 0 3.1 1.4 3.1 3.1v6.1c0 1.7-1.4 3.1-3.1 3.1H21v-9.2Z" fill="white" opacity="0.72" />
          </svg>
          <span className="brand-name">Storage Visualizer</span>
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
