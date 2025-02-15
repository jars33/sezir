
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TeamMemberTable } from "@/components/team/TeamMemberTable"
import type { TeamMember, SalaryHistory } from "@/types/team-member"

export default function TeamMemberDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: member, isLoading: isMemberLoading } = useQuery({
    queryKey: ["team-member", id],
    queryFn: async () => {
      if (!id) throw new Error("No team member ID provided")
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data as TeamMember
    },
  })

  const { data: salaryHistory, isLoading: isSalaryLoading } = useQuery({
    queryKey: ["team-member-salary-history", id],
    queryFn: async () => {
      if (!id) throw new Error("No team member ID provided")
      const { data, error } = await supabase
        .from("salary_history")
        .select("*")
        .eq("team_member_id", id)
        .order("start_date", { ascending: false })

      if (error) throw error
      return data as SalaryHistory[]
    },
  })

  if (isMemberLoading || isSalaryLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!member) {
    return <div className="p-8">Team member not found</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Team Member Details</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/team")}>
            Back to List
          </Button>
          <Button onClick={() => navigate(`/team/${id}/edit`)}>
            Edit Member
          </Button>
        </div>
      </div>

      <TeamMemberTable member={member} salaryHistory={salaryHistory} />
    </div>
  )
}
