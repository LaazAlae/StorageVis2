import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFileStore } from '../store/useFileStore';
import { layoutTree, linkPath, NODE_H, FOLDER_H } from '../utils/treeLayout';
import { heatColor, heatColorDark, textOnHeat, heatT, getMaxCount } from '../utils/colorScale';
import { formatSize, formatNumber, formatCount, timeAgo } from '../utils/formatters';
import { FolderIcon, FileIcon, topExts, Icon } from './Icons';
import { filterTreeByModifiedAge } from '../utils/importPreview';
import type { FolderNode, LayoutNode } from '../utils/types';

const VIEW_ANIMATION_MS = 760;
const ZOOM_ANIMATION_MS = 240;
const WHEEL_SETTLE_MS = 140;
const WHEEL_ZOOM_SENSITIVITY = 0.0011;

export function FolderTree() {
  const tree = useFileStore((s) => s.tree);
  const expanded = useFileStore((s) => s.expanded);
  const setExpanded = useFileStore((s) => s.setExpanded);
  const selectedFolder = useFileStore((s) => s.selectedFolder);
  const setSelectedFolder = useFileStore((s) => s.setSelectedFolder);
  const hideSystemFolders = useFileStore((s) => s.hideSystemFolders);
  const hideEmptyFolders = useFileStore((s) => s.hideEmptyFolders);
  const activeCutoffDays = useFileStore((s) => s.activeCutoffDays);
  const search = useFileStore((s) => s.search);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; name: string; path: string;
    count: number; size: string; lastMod: string; issues: number;
  } | null>(null);
  const [hasFit, setHasFit] = useState(false);
  const [viewAnimationMs, setViewAnimationMs] = useState(0);
  const viewAnimationTimer = useRef<number | null>(null);
  const pendingFocus = useRef<{ nodeId: string; mode: 'open' | 'close' | 'select' } | null>(null);

  const previewTree = useMemo(() => {
    if (!tree) return null;
    return filterTreeByModifiedAge(tree, activeCutoffDays, hideEmptyFolders || activeCutoffDays !== null);
  }, [tree, activeCutoffDays, hideEmptyFolders]);

  const layout = useMemo(() => {
    if (!previewTree) return null;
    return layoutTree(previewTree, expanded, hideSystemFolders);
  }, [previewTree, expanded, hideSystemFolders]);

  function animateView(next: { x: number; y: number; k: number }, duration = VIEW_ANIMATION_MS) {
    if (viewAnimationTimer.current !== null) {
      window.clearTimeout(viewAnimationTimer.current);
    }
    setViewAnimationMs(duration);
    setTransform(next);
    if (duration > 0) {
      viewAnimationTimer.current = window.setTimeout(() => {
        setViewAnimationMs(0);
        viewAnimationTimer.current = null;
      }, duration);
    }
  }

  useEffect(() => {
    return () => {
      if (viewAnimationTimer.current !== null) {
        window.clearTimeout(viewAnimationTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventPageZoom = (event: WheelEvent) => {
      if ((event.target as HTMLElement).closest('.inspector')) return;
      event.preventDefault();
    };
    canvas.addEventListener('wheel', preventPageZoom, { passive: false });
    return () => canvas.removeEventListener('wheel', preventPageZoom);
  }, []);

  useEffect(() => {
    if (hasFit || !layout) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw <= 0 || ch <= 0) return;
    const k = Math.min(1, (cw - 40) / layout.bounds.w);
    const k1 = Math.max(0.45, k);
    const x = cw / 2 - (layout.bounds.w / 2) * k1;
    animateView({ x, y: 32, k: k1 }, 0);
    setHasFit(true);
  }, [layout, hasFit]);

  useEffect(() => {
    const focus = pendingFocus.current;
    if (!focus || !layout) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const source = layout.nodes.find((n) => n.id === focus.nodeId);
    if (!source) return;

    const visibleChildren = layout.nodes.filter((n) => n.parentId === source.id);
    const focusNodes = focus.mode === 'open' && visibleChildren.length > 0
      ? [source, ...visibleChildren]
      : [source];

    const minX = Math.min(...focusNodes.map((n) => n.x - n.w / 2));
    const maxX = Math.max(...focusNodes.map((n) => n.x + n.w / 2));
    const minY = Math.min(...focusNodes.map((n) => n.y - FOLDER_H / 2));
    const maxY = Math.max(...focusNodes.map((n) => n.y + NODE_H / 2));

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    const groupW = Math.max(maxX - minX, source.w);
    const groupH = Math.max(maxY - minY, NODE_H);
    const fitK = Math.min((cw - 96) / groupW, (ch - 120) / groupH, 1.05);
    const k = focus.mode === 'close'
      ? Math.max(0.72, Math.min(1.05, fitK))
      : Math.max(0.28, Math.min(transform.k, fitK));
    const centerX = (minX + maxX) / 2;
    const sourceScreenY = focus.mode === 'open' ? Math.max(72, ch * 0.18) : ch * 0.34;

    pendingFocus.current = null;
    animateView({
      x: cw / 2 - centerX * k,
      y: sourceScreenY - source.y * k,
      k,
    });
  }, [layout]);

  function fitToView() {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight - 60;
    if (cw <= 0 || ch <= 0) return;
    const kX = cw / layout.bounds.w;
    const kY = ch / layout.bounds.h;
    const k = Math.max(0.4, Math.min(kX, kY, 1.0));
    const x = (cw - layout.bounds.w * k) / 2;
    animateView({ x, y: 32, k });
  }

  function centerOn(nodeId: string) {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const target = layout.nodes.find((n) => n.id === nodeId);
    if (!target) return;
    animateView({
      ...transform,
      x: cw / 2 - target.x * transform.k,
      y: ch * 0.35 - target.y * transform.k,
    });
  }

  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.fnode') || (e.target as HTMLElement).closest('.pile-node')) return;
    setViewAnimationMs(0);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const start = dragStart.current;
      if (!dragging || !start) return;
      setTransform((t) => ({
        ...t,
        x: start.tx + (e.clientX - start.x),
        y: start.ty + (e.clientY - start.y),
      }));
    }
    function onUp() {
      setDragging(false);
      dragStart.current = null;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  function onWheel(e: React.WheelEvent) {
    if ((e.target as HTMLElement).closest('.inspector') || (e.target as HTMLElement).closest('.sidebar')) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (viewAnimationTimer.current !== null) {
      window.clearTimeout(viewAnimationTimer.current);
    }
    setViewAnimationMs(WHEEL_SETTLE_MS);
    viewAnimationTimer.current = window.setTimeout(() => {
      setViewAnimationMs(0);
      viewAnimationTimer.current = null;
    }, WHEEL_SETTLE_MS);
    setTransform((t) => {
      const delta = Math.max(-120, Math.min(120, e.deltaY));
      const k1 = Math.max(0.15, Math.min(3, t.k * Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY)));
      const dx = (mx - t.x) * (k1 / t.k - 1);
      const dy = (my - t.y) * (k1 / t.k - 1);
      return { x: t.x - dx, y: t.y - dy, k: k1 };
    });
  }

  const zoomIn = () => animateView({ ...transform, k: Math.min(3, transform.k * 1.16) }, ZOOM_ANIMATION_MS);
  const zoomOut = () => animateView({ ...transform, k: Math.max(0.15, transform.k / 1.16) }, ZOOM_ANIMATION_MS);

  function onNodeClick(node: LayoutNode) {
    if (node.kind === 'pile') {
      setSelectedFolder(node.data, true);
      return;
    }
    const isOpening = !expanded.has(node.id);
    const next = new Set(expanded);
    if (next.has(node.id)) {
      next.delete(node.id);
      removeExpandedDescendants(node.data, next);
    } else {
      next.add(node.id);
    }
    pendingFocus.current = { nodeId: node.id, mode: isOpening ? 'open' : 'close' };
    setExpanded(next);
  }

  function removeExpandedDescendants(folder: FolderNode, next: Set<string>) {
    for (const child of folder.children) {
      next.delete(child.id);
      removeExpandedDescendants(child, next);
    }
  }

  const ancestorIds = useMemo(() => {
    if (!selectedFolder || !previewTree) return new Set<string>();
    const ids = new Set<string>();
    function walk(node: FolderNode): boolean {
      if (node.id === selectedFolder!.id) { ids.add(node.id); return true; }
      for (const c of node.children) { if (walk(c)) { ids.add(node.id); return true; } }
      return false;
    }
    walk(previewTree);
    return ids;
  }, [selectedFolder, previewTree]);

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = (n: LayoutNode) => searchLower && n.data.name.toLowerCase().includes(searchLower);

  function onNodeEnter(node: LayoutNode) {
    if (node.kind !== 'folder') return;
    const f = node.data;
    setTooltip({
      x: node.x, y: node.y - NODE_H / 2,
      name: f.name === previewTree?.name ? `${f.name}\\ (root)` : f.name,
      path: f.fullPath, count: f.recursiveFileCount,
      size: formatSize(f.recursiveSizeBytes),
      lastMod: f.lastMod ? timeAgo(f.lastMod) : '\u2014',
      issues: f.recursiveIssueCount,
    });
  }

  if (!tree || !previewTree || !layout) return null;

  const maxCount = getMaxCount();

  return (
    <div className={`canvas ${dragging ? 'dragging' : ''}`} ref={canvasRef}
      onMouseDown={onMouseDown} onWheel={onWheel}>
      <div
        className={`canvas-inner ${viewAnimationMs > 0 && !dragging ? 'animating' : ''}`}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transitionDuration: viewAnimationMs > 0 && !dragging ? `${viewAnimationMs}ms` : undefined,
        }}>
        <svg className="tree-svg" width={layout.bounds.w} height={layout.bounds.h}
          viewBox={`0 0 ${layout.bounds.w} ${layout.bounds.h}`}>
          {layout.links.map((l, i) => {
            const fromHi = ancestorIds.has(l.from.id);
            const toHi = ancestorIds.has(l.to.id);
            return <path key={i} d={linkPath(l.from, l.to)}
              className={`tree-link ${fromHi && toHi ? 'highlight' : ''}`} />;
          })}
        </svg>

        {layout.nodes.map((n) => {
          if (n.kind === 'folder') {
            const t = heatT(n.data.recursiveFileCount);
            const body = heatColor(t);
            const tab = heatColorDark(t);
            const txtColor = textOnHeat(t);
            const issues = n.data.recursiveIssueCount;
            const subText = `${formatSize(n.data.recursiveSizeBytes)} \u00b7 ${timeAgo(n.data.lastMod)}`;
            const isSelected = selectedFolder?.id === n.data.id;

            return (
              <div key={n.id}
                className={`fnode ${isSelected ? 'selected' : ''} ${n.hasHiddenChildren ? 'collapsed' : ''} ${matchesSearch(n) ? 'search-hit' : ''}`}
                style={{ left: n.x, top: n.y }}
                onClick={() => onNodeClick(n)}
                onMouseEnter={() => onNodeEnter(n)}
                onMouseLeave={() => setTooltip(null)}>
                <div className="fnode-icon-wrap">
                  <FolderIcon body={body} tab={tab} width={88} height={70} selected={isSelected} />
                  <div className="fnode-count" style={{ color: txtColor }}>
                    {formatCount(n.data.recursiveFileCount)}
                  </div>
                  {issues > 0 && (
                    <div className="fnode-status warn" title={`${issues} files with compatibility issues`}>
                      <Icon.Warn />
                    </div>
                  )}
                </div>
                <div className="fnode-meta">
                  <div className="fnode-name" title={n.data.name}>
                    {n.data.name === previewTree.name ? `${n.data.name}\\` : n.data.name}
                  </div>
                  <div className="fnode-sub">{subText}</div>
                </div>
              </div>
            );
          }

          // Pile node
          const files = n.data.files;
          const exts = topExts(files, 4);
          const count = files.length;
          const sizeTotal = files.reduce((s, f) => s + f.SizeBytes, 0);
          const rots = [0, -8, 7, -12];
          const xs = [0, -7, 8, -10];
          const ys = [0, 3, 1, 5];

          return (
            <div key={n.id} className="pile-node" style={{ left: n.x, top: n.y }}
              onClick={() => onNodeClick(n)}>
              <div className="pile-stack">
                {exts.slice(0, 4).map((ext, i) => {
                  const k = Math.min(exts.length, 4) - 1 - i;
                  return (
                    <div key={i} style={{
                      position: 'absolute', top: 0, left: '50%',
                      transform: `translate(-50%, 0) translate(${xs[k]}px, ${ys[k]}px) rotate(${rots[k]}deg)`,
                      zIndex: 10 + k,
                      filter: 'drop-shadow(0 1px 2px rgba(28,25,23,0.10))',
                    }}>
                      <FileIcon ext={ext} size={36} />
                    </div>
                  );
                })}
              </div>
              <div className="pile-meta">
                {formatNumber(count)} {count === 1 ? 'file' : 'files'}
                <span className="sub">{formatSize(sizeTotal)}</span>
              </div>
            </div>
          );
        })}

        {tooltip && (
          <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <div className="tooltip-name">{tooltip.name}</div>
            <div className="tooltip-row"><span>Path</span><span className="v" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tooltip.path}</span></div>
            <div className="tooltip-row"><span>Files (recursive)</span><span className="v">{formatNumber(tooltip.count)}</span></div>
            <div className="tooltip-row"><span>Total size</span><span className="v">{tooltip.size}</span></div>
            <div className="tooltip-row"><span>Last modified</span><span className="v">{tooltip.lastMod}</span></div>
            {tooltip.issues > 0 && (
              <div className="tooltip-row"><span>Issues</span><span className="v" style={{ color: '#fca5a5' }}>{formatNumber(tooltip.issues)}</span></div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: 16, bottom: 16, display: 'flex', gap: 8, zIndex: 5 }}>
        <div className="zoom-control">
          <button className="zoom-btn" onClick={zoomOut} title="Zoom out"><Icon.Minus /></button>
          <div className="zoom-val">{Math.round(transform.k * 100)}%</div>
          <button className="zoom-btn" onClick={zoomIn} title="Zoom in"><Icon.Plus /></button>
        </div>
        <button className="icon-btn" onClick={fitToView} title="Fit to view"
          style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <Icon.Fit />
        </button>
      </div>

      <HeatmapLegend maxCount={maxCount} />
    </div>
  );
}

function HeatmapLegend({ maxCount }: { maxCount: number }) {
  const stops = 18;
  return (
    <div style={{
      position: 'absolute', right: 16, bottom: 16, background: 'var(--bg-elev)',
      border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px',
      boxShadow: 'var(--shadow-sm)', zIndex: 5, width: 180,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Density (files)
      </div>
      <div style={{ display: 'flex', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        {Array.from({ length: stops }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 10, background: heatColor(i / (stops - 1)) }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
        <span>0</span>
        <span>{formatCount(Math.round(maxCount * 0.5))}</span>
        <span>{formatCount(maxCount)}</span>
      </div>
    </div>
  );
}
