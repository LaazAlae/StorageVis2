import { create } from 'zustand';
import type { FolderNode, DateMode } from '../utils/types';

type AppPhase = 'landing' | 'loading' | 'ready';

interface FileStore {
  phase: AppPhase;
  loadProgress: number;
  tree: FolderNode | null;
  dateMode: DateMode;
  activeTab: number;
  selectedFolderId: string | null;
  hideSystemFolders: boolean;

  setPhase: (phase: AppPhase) => void;
  setLoadProgress: (p: number) => void;
  setTree: (tree: FolderNode) => void;
  setDateMode: (mode: DateMode) => void;
  setActiveTab: (tab: number) => void;
  setSelectedFolderId: (id: string | null) => void;
  setHideSystemFolders: (hide: boolean) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  phase: 'landing',
  loadProgress: 0,
  tree: null,
  dateMode: 'modified',
  activeTab: 0,
  selectedFolderId: null,
  hideSystemFolders: true,

  setPhase: (phase) => set({ phase }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setTree: (tree) => set({ tree, phase: 'ready' }),
  setDateMode: (dateMode) => set({ dateMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId }),
  setHideSystemFolders: (hideSystemFolders) => set({ hideSystemFolders }),
}));
