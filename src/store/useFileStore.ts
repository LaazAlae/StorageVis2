import { create } from 'zustand';
import type { FolderNode, DateMode } from '../utils/types';

type AppPhase = 'landing' | 'loading' | 'ready';

interface FileStore {
  phase: AppPhase;
  loadProgress: number;
  tree: FolderNode | null;
  dateMode: DateMode;
  activeTab: number;
  hideSystemFolders: boolean;
  hideEmptyFolders: boolean;
  search: string;
  expanded: Set<string>;
  selectedFolder: FolderNode | null;
  pileView: boolean;

  setPhase: (phase: AppPhase) => void;
  setLoadProgress: (p: number) => void;
  setTree: (tree: FolderNode) => void;
  setDateMode: (mode: DateMode) => void;
  setActiveTab: (tab: number) => void;
  setHideSystemFolders: (hide: boolean) => void;
  setHideEmptyFolders: (hide: boolean) => void;
  setSearch: (s: string) => void;
  setExpanded: (e: Set<string>) => void;
  setSelectedFolder: (f: FolderNode | null, pile?: boolean) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  phase: 'landing',
  loadProgress: 0,
  tree: null,
  dateMode: 'modified',
  activeTab: 0,
  hideSystemFolders: true,
  hideEmptyFolders: false,
  search: '',
  expanded: new Set(['root']),
  selectedFolder: null,
  pileView: false,

  setPhase: (phase) => set({ phase }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setTree: (tree) => set({ tree, phase: 'ready' }),
  setDateMode: (dateMode) => set({ dateMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setHideSystemFolders: (hideSystemFolders) => set({ hideSystemFolders }),
  setHideEmptyFolders: (hideEmptyFolders) => set({ hideEmptyFolders }),
  setSearch: (search) => set({ search }),
  setExpanded: (expanded) => set({ expanded }),
  setSelectedFolder: (selectedFolder, pile) =>
    set({ selectedFolder, pileView: pile ?? false }),
}));
