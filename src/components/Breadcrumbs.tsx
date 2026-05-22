import React, { useMemo } from 'react';
import { useFileStore } from '../store/useFileStore';
import { Icon } from './Icons';
import type { FolderNode } from '../utils/types';

export function Breadcrumbs() {
  const tree = useFileStore((s) => s.tree);
  const selectedFolder = useFileStore((s) => s.selectedFolder);

  const chain = useMemo(() => {
    if (!tree) return [];
    if (!selectedFolder) return [{ name: `${tree.name}\\`, folder: tree }];
    const idMap = new Map<string, FolderNode>();
    function index(node: FolderNode) {
      idMap.set(node.id, node);
      for (const c of node.children) index(c);
    }
    index(tree);
    const arr: { name: string; folder: FolderNode }[] = [];
    let cur: FolderNode | undefined = selectedFolder;
    while (cur) {
      arr.unshift({ name: cur.id === 'root' ? `${cur.name}\\` : cur.name, folder: cur });
      cur = cur.parentId ? idMap.get(cur.parentId) : undefined;
    }
    return arr;
  }, [tree, selectedFolder]);

  if (!tree) return null;

  return (
    <div className="breadcrumbs">
      <Icon.Folder className="crumb-icon" />
      {chain.map((seg, i) => {
        const isLast = i === chain.length - 1;
        return (
          <React.Fragment key={seg.folder.id}>
            {i > 0 && <span className="crumb-sep">{'\u203a'}</span>}
            <button className={`crumb ${isLast ? 'current' : ''}`}>
              {seg.name}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
