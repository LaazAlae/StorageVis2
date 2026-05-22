import type { FileRow, FolderNode } from '../utils/types';

interface RawRow {
  FullPath: string;
  FileName: string;
  Extension: string;
  SizeBytes: string;
  SizeKB: string;
  SizeMB: string;
  CreatedDate: string;
  ModifiedDate: string;
  AccessedDate: string;
  DaysSinceModified: string;
  DaysSinceAccessed: string;
  YearsSinceModified: string;
  FolderDepth: string;
  ParentFolder: string;
  Department: string;
  FileCategory: string;
  IsTempFile: string;
  IsEmptyFile: string;
  IsProbablyDuplicate: string;
  IsTemplateFile: string;
  IsMacroEnabled: string;
  MayBeLinkedDataSource: string;
  IsOutlookDataFile: string;
  SharePointCompatibility: string;
  PathLength: string;
  MigrationPriority: string;
  DCISCompatibility: string;
}

function parseBool(val: string): boolean {
  return val === 'True' || val === 'true' || val === 'TRUE';
}

function parseTimestamp(val: string): number {
  if (!val) return 0;
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
}

function parseRow(raw: RawRow): FileRow {
  return {
    FullPath: raw.FullPath || '',
    FileName: raw.FileName || '',
    Extension: raw.Extension || '',
    SizeBytes: parseInt(raw.SizeBytes, 10) || 0,
    SizeKB: parseFloat(raw.SizeKB) || 0,
    SizeMB: parseFloat(raw.SizeMB) || 0,
    CreatedDate: parseTimestamp(raw.CreatedDate),
    ModifiedDate: parseTimestamp(raw.ModifiedDate),
    AccessedDate: parseTimestamp(raw.AccessedDate),
    DaysSinceModified: parseInt(raw.DaysSinceModified, 10) || 0,
    DaysSinceAccessed: parseInt(raw.DaysSinceAccessed, 10) || 0,
    YearsSinceModified: parseFloat(raw.YearsSinceModified) || 0,
    FolderDepth: parseInt(raw.FolderDepth, 10) || 0,
    ParentFolder: raw.ParentFolder || '',
    Department: raw.Department || '',
    FileCategory: raw.FileCategory || '',
    IsTempFile: parseBool(raw.IsTempFile),
    IsEmptyFile: parseBool(raw.IsEmptyFile),
    IsProbablyDuplicate: parseBool(raw.IsProbablyDuplicate),
    IsTemplateFile: parseBool(raw.IsTemplateFile),
    IsMacroEnabled: parseBool(raw.IsMacroEnabled),
    MayBeLinkedDataSource: parseBool(raw.MayBeLinkedDataSource),
    IsOutlookDataFile: parseBool(raw.IsOutlookDataFile),
    SharePointCompatibility: raw.SharePointCompatibility || '',
    PathLength: parseInt(raw.PathLength, 10) || 0,
    MigrationPriority: raw.MigrationPriority || '',
    DCISCompatibility: raw.DCISCompatibility || '',
  };
}

export function buildTree(rawRows: RawRow[]): FolderNode {
  const folderMap = new Map<string, FolderNode>();

  // Create root node
  const root: FolderNode = {
    id: 'root',
    name: 'Root',
    path: '',
    depth: 0,
    parentId: null,
    children: [],
    files: [],
    recursiveFileCount: 0,
    recursiveSizeBytes: 0,
    maxModifiedDate: 0,
    maxCreatedDate: 0,
  };
  folderMap.set('', root);

  for (const raw of rawRows) {
    const file = parseRow(raw);
    const fullPath = file.FullPath;
    if (!fullPath) continue;

    // Split path and remove drive letter prefix
    const segments = fullPath.split('\\');
    // First segment is like "O:" — remove it
    if (segments.length > 0 && /^[A-Z]:$/i.test(segments[0])) {
      segments.shift();
    }
    // Last segment is the filename
    if (segments.length === 0) continue;
    segments.pop();

    // Ensure all folder segments exist
    let currentPath = '';
    let parentPath = '';
    for (let i = 0; i < segments.length; i++) {
      parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}\\${segments[i]}` : segments[i];

      if (!folderMap.has(currentPath)) {
        const folder: FolderNode = {
          id: currentPath,
          name: segments[i],
          path: currentPath,
          depth: i + 1,
          parentId: parentPath || 'root',
          children: [],
          files: [],
          recursiveFileCount: 0,
          recursiveSizeBytes: 0,
          maxModifiedDate: 0,
          maxCreatedDate: 0,
        };
        folderMap.set(currentPath, folder);

        // Attach to parent
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children.push(folder);
        } else {
          // Attach to root if parent somehow doesn't exist
          root.children.push(folder);
        }
      }
    }

    // Attach file to its parent folder
    const parentFolder = folderMap.get(currentPath);
    if (parentFolder) {
      parentFolder.files.push(file);
    } else {
      // File at root level (no folder segments after removing drive letter)
      root.files.push(file);
    }
  }

  // Bottom-up metadata bubbling
  function computeStats(folder: FolderNode): void {
    // First, recurse into children
    for (const child of folder.children) {
      computeStats(child);
    }

    // Compute stats from direct files
    let fileCount = folder.files.length;
    let sizeBytes = 0;
    let maxMod = 0;
    let maxCreated = 0;

    for (const f of folder.files) {
      sizeBytes += f.SizeBytes;
      if (f.ModifiedDate > maxMod) maxMod = f.ModifiedDate;
      if (f.CreatedDate > maxCreated) maxCreated = f.CreatedDate;
    }

    // Add children's stats
    for (const child of folder.children) {
      fileCount += child.recursiveFileCount;
      sizeBytes += child.recursiveSizeBytes;
      if (child.maxModifiedDate > maxMod) maxMod = child.maxModifiedDate;
      if (child.maxCreatedDate > maxCreated) maxCreated = child.maxCreatedDate;
    }

    folder.recursiveFileCount = fileCount;
    folder.recursiveSizeBytes = sizeBytes;
    folder.maxModifiedDate = maxMod;
    folder.maxCreatedDate = maxCreated;
  }

  computeStats(root);

  return root;
}
