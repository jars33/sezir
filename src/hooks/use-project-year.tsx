
import { create } from "zustand"

interface ProjectYearState {
  year: number
  setYear: (year: number) => void
}

export const useProjectYear = create<ProjectYearState>((set) => ({
  year: new Date().getFullYear(),
  setYear: (year) => set({ year }),
}))
