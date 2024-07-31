import { create } from "zustand";

interface ISplinesStore {
  hasLoadingSplines: boolean;
  isLandingSplineLoading: boolean;
  isIndexSplineLoading: boolean;
  setIsLandingSplineLoading: (value: boolean) => void;
  setIsIndexSplineLoading: (value: boolean) => void;
  updateHasLoadingSplines: () => void;
}

const initialState = {
  hasLoadingSplines: true,
  isLandingSplineLoading: true,
  isIndexSplineLoading: true,
};

export const useSplinesStore = create<ISplinesStore>((set, get) => ({
  ...initialState,
  updateHasLoadingSplines: () => {
    const { isLandingSplineLoading, isIndexSplineLoading } = get();
    set({ hasLoadingSplines: isLandingSplineLoading || isIndexSplineLoading });
  },
  setIsLandingSplineLoading: (value: boolean) => {
    set({ isLandingSplineLoading: value });
    get().updateHasLoadingSplines();
  },
  setIsIndexSplineLoading: (value: boolean) => {
    set({ isIndexSplineLoading: value });
    get().updateHasLoadingSplines();
  },
}));
