import { create } from 'zustand';
import type { FolderNode } from '../utils/types';

type AppPhase = 'landing' | 'loading' | 'ready';

interface FileStore {
  phase: AppPhase;
  loadProgress: number;
  tree: FolderNode | null;
  activeTab: number;
  hideSystemFolders: boolean;
  hideEmptyFolders: boolean;
  activeCutoffDays: number | null;
  search: string;
  expanded: Set<string>;
  selectedFolder: FolderNode | null;
  pileView: boolean;

  setPhase: (phase: AppPhase) => void;
  setLoadProgress: (p: number) => void;
  setTree: (tree: FolderNode) => void;
  setActiveTab: (tab: number) => void;
  setHideSystemFolders: (hide: boolean) => void;
  setHideEmptyFolders: (hide: boolean) => void;
  setActiveCutoffDays: (days: number | null) => void;
  setSearch: (s: string) => void;
  setExpanded: (e: Set<string>) => void;
  setSelectedFolder: (f: FolderNode | null, pile?: boolean) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  phase: 'landing',
  loadProgress: 0,
  tree: null,
  activeTab: 0,
  hideSystemFolders: true,
  hideEmptyFolders: false,
  activeCutoffDays: null,
  search: '',
  expanded: new Set(['root']),
  selectedFolder: null,
  pileView: false,

  setPhase: (phase) => set({ phase }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setTree: (tree) => set({ tree, phase: 'ready' }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setHideSystemFolders: (hideSystemFolders) => set({ hideSystemFolders }),
  setHideEmptyFolders: (hideEmptyFolders) => set({ hideEmptyFolders }),
  setActiveCutoffDays: (activeCutoffDays) => set({ activeCutoffDays }),
  setSearch: (search) => set({ search }),
  setExpanded: (expanded) => set({ expanded }),
  setSelectedFolder: (selectedFolder, pile) =>
    set({ selectedFolder, pileView: pile ?? false }),
}));
