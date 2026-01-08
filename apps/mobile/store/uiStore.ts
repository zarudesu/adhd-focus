import { create } from 'zustand';

interface UIState {
  // Quick Capture Modal
  isQuickCaptureOpen: boolean;
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
  toggleQuickCapture: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isQuickCaptureOpen: false,

  openQuickCapture: () => set({ isQuickCaptureOpen: true }),
  closeQuickCapture: () => set({ isQuickCaptureOpen: false }),
  toggleQuickCapture: () => set((state) => ({ isQuickCaptureOpen: !state.isQuickCaptureOpen })),
}));
