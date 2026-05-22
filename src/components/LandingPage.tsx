import React, { useCallback, useRef, useState } from 'react';
import { useFileStore } from '../store/useFileStore';
import { parseCSV } from '../pipeline/csvParser';
import { buildTree } from '../pipeline/treeBuilder';
import { initColorScale } from '../utils/colorScale';

export const LandingPage = React.memo(function LandingPage() {
  const setPhase = useFileStore((s) => s.setPhase);
  const setLoadProgress = useFileStore((s) => s.setLoadProgress);
  const setTree = useFileStore((s) => s.setTree);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setPhase('loading');
      setLoadProgress(0);
      try {
        const rows = await parseCSV(file, (p) => setLoadProgress(p.percent));
        setLoadProgress(100);
        const tree = buildTree(rows as any);
        // Find max recursive file count across all folders for color scale
        let maxFiles = 0;
        function walk(node: typeof tree) {
          if (node.recursiveFileCount > maxFiles) maxFiles = node.recursiveFileCount;
          for (const c of node.children) walk(c);
        }
        walk(tree);
        initColorScale(maxFiles);
        setTree(tree);
      } catch (e) {
        console.error('Failed to parse CSV:', e);
        setPhase('landing');
      }
    },
    [setPhase, setLoadProgress, setTree],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="landing-page">
      <h1 className="landing-title">File Inventory Explorer</h1>
      <div
        className={`drop-zone ${dragging ? 'drop-zone--active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <div className="drop-zone-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="drop-zone-text">Drop your CSV file here or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      <p className="landing-description">
        Visualize file inventory data from your pre-migration scan. All processing
        happens locally in your browser — no data is uploaded anywhere.
      </p>
    </div>
  );
});
