
import { useLocalStorage } from "@/hooks/use-local-storage";

// Default settings with overhead percentages by year
const defaultSettings = {
  overheadPercentageByYear: {
    // Set some reasonable defaults
    2023: 15, // 15%
    2024: 15, // 15%
    2025: 15, // 15%
  },
};

export function useProjectSettings() {
  const [settings, setSettings] = useLocalStorage(
    "project-settings",
    defaultSettings
  );

  // Function to update the overhead percentage for a specific year
  const updateOverheadPercentage = (year: number, percentage: number) => {
    setSettings({
      ...settings,
      overheadPercentageByYear: {
        ...settings.overheadPercentageByYear,
        [year]: percentage,
      },
    });
  };

  // Function to get the overhead percentage for a specific year
  const getOverheadPercentage = (year: number): number => {
    return settings.overheadPercentageByYear[year] || 15; // Default to 15% if not set
  };

  return {
    settings,
    updateOverheadPercentage,
    getOverheadPercentage,
  };
}
