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
  depth: number;
  parentId: string | null;
  children: FolderNode[];
  files: FileRow[];
  recursiveFileCount: number;
  recursiveSizeBytes: number;
  maxModifiedDate: number;
  maxCreatedDate: number;
}

export type DateMode = 'modified' | 'created';

export type NodeType = 'folder' | 'filePile';

export interface OrgChartDatum {
  id: string;
  parentId: string;
  name: string;
  recursiveFileCount: number;
  recursiveSizeBytes: number;
  maxDate: number;
  depth: number;
  nodeType: NodeType;
  _folderNode: FolderNode;
}
