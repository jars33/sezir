
import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/supabase";
import type { TeamMember, SalaryHistory } from "@/types/team-member";

export function useTeamMember(id: string | undefined) {
  const { data: member, isLoading: isMemberLoading } = useQuery({
    queryKey: ["team-member", id],
    queryFn: async () => {
      if (!id || id === 'new') return null;
      return teamService.getTeamMember(id);
    },
  });

  const { data: salaryHistory, isLoading: isSalaryLoading, refetch: refetchSalaryHistory } = useQuery({
    queryKey: ["team-member-salary-history", id],
    queryFn: async () => {
      if (!id || id === 'new') return [];
      return teamService.getSalaryHistory(id);
    },
  });

  return {
    member,
    salaryHistory,
    isMemberLoading,
    isSalaryLoading,
    refetchSalaryHistory,
  };
}
