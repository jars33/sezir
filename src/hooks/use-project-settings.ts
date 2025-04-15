
import { useLocalStorage } from "./use-local-storage";

interface ProjectSettings {
  overheadPercentages: Record<number, number>;
}

export function useProjectSettings() {
  const [settings, setSettings] = useLocalStorage<ProjectSettings>("project_settings", {
    overheadPercentages: {
      2023: 15,
      2024: 15,
      2025: 15,
    }
  });

  // Get the overhead percentage for a specific year
  const getOverheadPercentage = (year: number): number => {
    return settings.overheadPercentages[year] || 15; // Default to 15% if not set
  };

  // Set the overhead percentage for a specific year
  const setOverheadPercentage = (year: number, percentage: number): void => {
    setSettings({
      ...settings,
      overheadPercentages: {
        ...settings.overheadPercentages,
        [year]: percentage
      }
    });
  };

  return {
    getOverheadPercentage,
    setOverheadPercentage,
  };
}
