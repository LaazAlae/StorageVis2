import type { FileRow, FolderNode } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function cutoffTimestamp(days: number | null): number | null {
  if (!days) return null;
  return Date.now() - days * DAY_MS;
}

export function matchesModifiedCutoff(file: FileRow, days: number | null): boolean {
  const cutoff = cutoffTimestamp(days);
  if (!cutoff) return true;
  return file.ModifiedDate > 0 && file.ModifiedDate >= cutoff;
}

export function filterTreeByModifiedAge(
  root: FolderNode,
  days: number | null,
  hideEmptyFolders = true,
): FolderNode {
  const cutoff = cutoffTimestamp(days);
  if (!cutoff && !hideEmptyFolders) return root;

  function clone(node: FolderNode): FolderNode | null {
    const files = node.files.filter((file) => matchesModifiedCutoff(file, days));
    const children = node.children
      .map(clone)
      .filter((child): child is FolderNode => child !== null);

    const directSize = files.reduce((sum, file) => sum + file.SizeBytes, 0);
    const directIssues = files.filter(
      (file) => file.SharePointCompatibility !== 'OK' && file.SharePointCompatibility !== '',
    ).length;
    const maxModified = Math.max(0, ...files.map((file) => file.ModifiedDate));
    const maxCreated = Math.max(0, ...files.map((file) => file.CreatedDate));
    const recursiveFileCount = files.length + children.reduce((sum, child) => sum + child.recursiveFileCount, 0);
    const recursiveSizeBytes = directSize + children.reduce((sum, child) => sum + child.recursiveSizeBytes, 0);
    const recursiveIssueCount = directIssues + children.reduce((sum, child) => sum + child.recursiveIssueCount, 0);
    const maxModifiedDate = Math.max(maxModified, ...children.map((child) => child.maxModifiedDate));
    const maxCreatedDate = Math.max(maxCreated, ...children.map((child) => child.maxCreatedDate));

    if (node.id !== 'root' && hideEmptyFolders && recursiveFileCount === 0) return null;

    return {
      ...node,
      files,
      children,
      recursiveFileCount,
      recursiveSizeBytes,
      recursiveIssueCount,
      maxModifiedDate,
      maxCreatedDate,
      lastMod: maxModifiedDate,
    };
  }

  return clone(root) || {
    ...root,
    files: [],
    children: [],
    recursiveFileCount: 0,
    recursiveSizeBytes: 0,
    recursiveIssueCount: 0,
    maxModifiedDate: 0,
    maxCreatedDate: 0,
    lastMod: 0,
  };
}
