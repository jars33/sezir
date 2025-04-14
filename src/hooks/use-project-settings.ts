
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Default settings with overhead percentages by year
const defaultSettings = {
  overheadPercentageByYear: {
    // Set some reasonable defaults
    [new Date().getFullYear()]: 15.0, // 15% for current year
    [new Date().getFullYear() + 1]: 15.0, // 15% for next year
    [new Date().getFullYear() + 2]: 15.0, // 15% for the year after next
  },
};

export function useProjectSettings() {
  const { session } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Fetch settings from the database
  const fetchSettings = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_overhead_settings")
        .select("year, percentage")
        .eq("user_id", session.user.id);

      if (error) throw error;

      // Convert data to the format used by the application
      const dbSettings = {
        overheadPercentageByYear: {},
      };

      // Add db settings to our state
      data?.forEach((item) => {
        // Ensure item.year is treated as a number key for the object
        dbSettings.overheadPercentageByYear[Number(item.year)] = Number(item.percentage);
      });

      // Merge with defaults for any missing years
      setSettings({
        overheadPercentageByYear: {
          ...defaultSettings.overheadPercentageByYear,
          ...dbSettings.overheadPercentageByYear,
        },
      });
    } catch (error) {
      console.error("Error fetching project settings:", error);
      toast.error("Failed to load project settings");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Fetch settings when the component mounts or session changes
  useEffect(() => {
    fetchSettings();
  }, [session, fetchSettings]);

  // Function to update the overhead percentage for a specific year
  const updateOverheadPercentage = async (year: number, percentage: number) => {
    if (!session?.user) {
      toast.error("You must be logged in to update settings");
      return;
    }

    try {
      // Update local state immediately for a responsive UI
      setSettings({
        ...settings,
        overheadPercentageByYear: {
          ...settings.overheadPercentageByYear,
          [year]: percentage,
        },
      });

      // Format the percentage to ensure decimal precision is maintained
      const formattedPercentage = parseFloat(percentage.toString()).toFixed(1);

      // Upsert to the database (insert if not exists, update if exists)
      const { error } = await supabase
        .from("project_overhead_settings")
        .upsert(
          [
            {
              year: Number(year), // Explicitly convert to number
              percentage: Number(formattedPercentage), // Convert to number
              user_id: session.user.id,
            }
          ],
          {
            onConflict: "year, user_id",
          }
        );

      if (error) throw error;
      
      // Refresh settings after update to ensure we have the latest data
      await fetchSettings();
    } catch (error) {
      console.error("Error updating project settings:", error);
      toast.error("Failed to update project settings");
      
      // Revert the local state change on error
      await fetchSettings();
    }
  };

  // Function to get the overhead percentage for a specific year
  const getOverheadPercentage = useCallback((year: number): number => {
    return settings.overheadPercentageByYear[year] || 15.0; // Default to 15% if not set
  }, [settings]);

  return {
    settings,
    loading,
    updateOverheadPercentage,
    getOverheadPercentage,
  };
}
