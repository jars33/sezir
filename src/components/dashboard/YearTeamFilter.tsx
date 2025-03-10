
import React from "react";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-8 mb-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="year-filter" className="text-sm font-medium">Year</label>
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-r-none h-10 w-10 border-r-0" 
            onClick={handlePreviousYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center bg-background font-medium border border-input h-10 px-8">
            {selectedYear}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-l-none h-10 w-10 border-l-0" 
            onClick={handleNextYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="team-filter" className="text-sm font-medium">Team</label>
        <Select
          value={selectedTeam || "all"}
          onValueChange={(value) => setSelectedTeam(value === "all" ? null : value)}
        >
          <SelectTrigger id="team-filter" className="w-[180px]">
            <SelectValue placeholder="All Teams" />
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
