
import React from "react";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface YearTeamFilterProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedTeam: string | null;
  setSelectedTeam: (team: string | null) => void;
}

const YearTeamFilter: React.FC<YearTeamFilterProps> = ({
  selectedYear,
  setSelectedYear,
  selectedTeam,
  setSelectedTeam,
}) => {
  // Generate year options (current year and 4 years before)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch teams
  const { data: teams, isLoading: isTeamsLoading } = useQuery({
    queryKey: ["teams-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="year-filter">Year</Label>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger id="year-filter" className="w-[150px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="team-filter">Team</Label>
        <Select
          value={selectedTeam || "all"}
          onValueChange={(value) => setSelectedTeam(value === "all" ? null : value)}
        >
          <SelectTrigger id="team-filter" className="w-[150px]">
            <SelectValue placeholder="Select Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default YearTeamFilter;
