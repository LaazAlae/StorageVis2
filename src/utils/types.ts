export interface FileRow {
  FullPath: string;
  FileName: string;
  Extension: string;
  SizeBytes: number;
  SizeKB: number;
  SizeMB: number;
  CreatedDate: number;   // Unix timestamp (ms)
  ModifiedDate: number;  // Unix timestamp (ms)
  AccessedDate: number;  // Unix timestamp (ms)
  DaysSinceModified: number;
  DaysSinceAccessed: number;
  YearsSinceModified: number;
  FolderDepth: number;
  ParentFolder: string;
  Department: string;
  FileCategory: string;
  IsTempFile: boolean;
  IsEmptyFile: boolean;
  IsProbablyDuplicate: boolean;
  IsTemplateFile: boolean;
  IsMacroEnabled: boolean;
  MayBeLinkedDataSource: boolean;
  IsOutlookDataFile: boolean;
  SharePointCompatibility: string;
  PathLength: number;
  MigrationPriority: string;
  DCISCompatibility: string;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  fullPath: string;
  depth: number;
  parentId: string | null;
  children: FolderNode[];
  files: FileRow[];
  recursiveFileCount: number;
  recursiveSizeBytes: number;
  recursiveIssueCount: number;
  maxModifiedDate: number;
  maxCreatedDate: number;
  lastMod: number;
}

export type DateMode = 'modified' | 'created';

export interface LayoutNode {
  id: string;
  kind: 'folder' | 'pile';
  x: number;
  y: number;
  w: number;
  depth: number;
  data: FolderNode;
  parentId: string | null;
  isOpen: boolean;
  hasHiddenChildren: boolean;
}

export interface LayoutLink {
  from: LayoutNode;
  to: LayoutNode;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  links: LayoutLink[];
  bounds: { w: number; h: number };
}
