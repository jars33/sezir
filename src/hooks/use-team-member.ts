
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { TeamMember, SalaryHistory } from "@/types/team-member"

export function useTeamMember(id: string | undefined) {
  const { data: member, isLoading: isMemberLoading } = useQuery({
    queryKey: ["team-member", id],
    queryFn: async () => {
      if (!id || id === 'new') return null
      const { data, error } = await supabase
        .from("team_members")
        .select()
        .eq("id", id)
        .maybeSingle()

      if (error) throw error
      return data as TeamMember | null
    },
  })

  const { data: salaryHistory, isLoading: isSalaryLoading, refetch: refetchSalaryHistory } = useQuery({
    queryKey: ["team-member-salary-history", id],
    queryFn: async () => {
      if (!id || id === 'new') return []
      const { data, error } = await supabase
        .from("salary_history")
        .select()
        .eq("team_member_id", id)
        .order("start_date", { ascending: false })

      if (error) throw error
      return data as SalaryHistory[]
    },
  })

  return {
    member,
    salaryHistory,
    isMemberLoading,
    isSalaryLoading,
    refetchSalaryHistory,
  }
}
