import { create } from "zustand";

interface ISplinesStore {
  hasLoadingSplines: boolean;
  isLandingSplineLoading: boolean;
  isIndexSplineLoading: boolean;
  isSkillsSplineLoading: boolean;
  setIsIndexSplineLoading: (value: boolean) => void;
  setIsLandingSplineLoading: (value: boolean) => void;
  setIsSkillsSplineLoading: (value: boolean) => void;
  updateHasLoadingSplines: () => void;
}

const initialState = {
  hasLoadingSplines: true,
  isLandingSplineLoading: true,
  isIndexSplineLoading: true,
  isSkillsSplineLoading: true,
};

export const useSplinesStore = create<ISplinesStore>((set, get) => ({
  ...initialState,
  updateHasLoadingSplines: () => {
    const { isLandingSplineLoading, isIndexSplineLoading } = get();
    set({ hasLoadingSplines: isLandingSplineLoading || isIndexSplineLoading });
  },
  setIsIndexSplineLoading: (value: boolean) => {
    set({ isIndexSplineLoading: value });
    get().updateHasLoadingSplines();
  },
  setIsLandingSplineLoading: (value: boolean) => {
    set({ isLandingSplineLoading: value });
    get().updateHasLoadingSplines();
  },
  setIsSkillsSplineLoading: (value: boolean) => {
    set({ isSkillsSplineLoading: value });
    get().updateHasLoadingSplines();
  },
}));
