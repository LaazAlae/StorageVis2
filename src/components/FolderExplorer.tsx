import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { OrgChart } from 'd3-org-chart';
import { useFileStore } from '../store/useFileStore';
import { renderFolderNodeHTML, renderFilePileHTML } from './FolderNode';
import { Breadcrumbs } from './Breadcrumbs';
import { DateToggle } from './DateToggle';
import { FileTray } from './FileTray';
import type { FolderNode, OrgChartDatum } from '../utils/types';

function flattenTree(root: FolderNode, hideSystem: boolean): OrgChartDatum[] {
  const result: OrgChartDatum[] = [];

  function walk(node: FolderNode, parentId: string) {
    if (hideSystem && node.name.startsWith('$') && node.depth > 0) return;

    const id = node.id || 'root';
    result.push({
      id,
      parentId,
      name: node.name,
      recursiveFileCount: node.recursiveFileCount,
      recursiveSizeBytes: node.recursiveSizeBytes,
      maxDate: node.maxModifiedDate,
      depth: node.depth,
      nodeType: 'folder',
      _folderNode: node,
    });

    for (const child of node.children) {
      walk(child, id);
    }

    // File pile pseudo-node for folders with direct files
    if (node.files.length > 0) {
      result.push({
        id: `${id}__files`,
        parentId: id,
        name: `${node.files.length} files`,
        recursiveFileCount: node.files.length,
        recursiveSizeBytes: 0,
        maxDate: 0,
        depth: node.depth + 1,
        nodeType: 'filePile',
        _folderNode: node,
      });
    }
  }

  walk(root, '');
  return result;
}

export const FolderExplorer = React.memo(function FolderExplorer() {
  const tree = useFileStore((s) => s.tree);
  const dateMode = useFileStore((s) => s.dateMode);
  const hideSystemFolders = useFileStore((s) => s.hideSystemFolders);
  const setHideSystemFolders = useFileStore((s) => s.setHideSystemFolders);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<OrgChart<OrgChartDatum> | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string | null>(null);

  const flatData = useMemo(() => {
    if (!tree) return [];
    return flattenTree(tree, hideSystemFolders);
  }, [tree, hideSystemFolders]);

  const folderMap = useMemo(() => {
    const map = new Map<string, FolderNode>();
    if (!tree) return map;
    function walk(node: FolderNode) {
      map.set(node.id || 'root', node);
      for (const c of node.children) walk(c);
    }
    walk(tree);
    return map;
  }, [tree]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const actualId = nodeId.endsWith('__files')
        ? nodeId.replace('__files', '')
        : nodeId;
      const folder = folderMap.get(actualId);
      if (folder) {
        setSelectedFolder(folder);
        setBreadcrumbPath(folder.path);
      }
    },
    [folderMap],
  );

  const handleBreadcrumbNavigate = useCallback(
    (path: string) => {
      const id = path || 'root';
      const folder = folderMap.get(id);
      if (folder) {
        setSelectedFolder(folder);
        setBreadcrumbPath(folder.path);
      } else {
        setSelectedFolder(null);
        setBreadcrumbPath(null);
      }
      const chart = chartRef.current;
      if (chart) {
        try { chart.setCentered(id).render(); } catch { /* ignore */ }
      }
    },
    [folderMap],
  );

  const renderNodeContent = useCallback((d: any) => {
    const datum = d.data as OrgChartDatum;
    if (datum.nodeType === 'filePile') {
      return renderFilePileHTML(datum._folderNode.files, datum._folderNode.files.length);
    }
    return renderFolderNodeHTML(datum._folderNode);
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current || flatData.length === 0) return;

    const chart = new OrgChart<OrgChartDatum>();
    chartRef.current = chart;

    chart
      .container(containerRef.current as any)
      .data(flatData as any)
      .nodeWidth((d: any) => {
        const datum = d.data as OrgChartDatum;
        return datum.nodeType === 'filePile' ? 70 : 110;
      })
      .nodeHeight((d: any) => {
        const datum = d.data as OrgChartDatum;
        return datum.nodeType === 'filePile' ? 60 : 70;
      })
      .compactMarginBetween((d: any) => 15)
      .compactMarginPair((d: any) => 15)
      .siblingsMargin((d: any) => 15)
      .childrenMargin((d: any) => 30)
      .neighbourMargin((a: any, b: any) => 40)
      .compact(false)
      .scaleExtent([0.1, 5] as any)
      .nodeContent(renderNodeContent)
      .onNodeClick((d: any) => {
        const datum = d.data ?? d;
        handleNodeClick(datum.id);
      })
      .nodeUpdate((d: any, i: number, arr: any[]) => {
        const el = arr[i] as Element;
        const rect = el?.querySelector('.node-rect');
        if (rect) {
          rect.setAttribute('fill', 'none');
          rect.setAttribute('stroke', 'none');
        }
      })
      .render();

    try {
      chart.collapseAll();
      flatData.forEach((d) => {
        if (d.depth < 2 && d.nodeType === 'folder') {
          try { (chart as any).setExpanded(d.id, true); } catch { /* ignore */ }
        }
      });
      chart.render();
      chart.fit();
    } catch {
      chart.render();
    }

    return () => { chartRef.current = null; };
  }, [flatData, renderNodeContent, handleNodeClick]);

  // Re-render when dateMode changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.nodeContent(renderNodeContent).render();
  }, [dateMode, renderNodeContent]);

  if (!tree) return null;

  return (
    <div className="folder-explorer">
      <div className="explorer-toolbar">
        <Breadcrumbs path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />
        <div className="toolbar-controls">
          <label className="system-folder-toggle">
            <input
              type="checkbox"
              checked={hideSystemFolders}
              onChange={(e) => setHideSystemFolders(e.target.checked)}
            />
            <span>Hide $ folders</span>
          </label>
          <DateToggle />
        </div>
      </div>
      <div className="explorer-content">
        <div className="chart-container" ref={containerRef} />
      </div>
      {selectedFolder && selectedFolder.files.length > 0 && (
        <FileTray
          folder={selectedFolder}
          dateMode={dateMode}
          onClose={() => setSelectedFolder(null)}
        />
      )}
    </div>
  );
});
