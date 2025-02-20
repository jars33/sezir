
import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TeamMemberForm } from "@/components/team/TeamMemberForm"
import { SalaryHistory } from "@/components/team/salary/SalaryHistory"
import { useAuth } from "@/components/AuthProvider"
import { useTeamMember } from "@/hooks/use-team-member"
import type { TeamMemberFormSchema } from "@/components/team/team-member-schema"

export default function TeamMemberDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  const { member, salaryHistory, isMemberLoading, isSalaryLoading, refetchSalaryHistory } = useTeamMember(id)

  const handleAddSalary = async (values: { amount: string, start_date: string, end_date: string }) => {
    if (!id || id === 'new' || !session?.user.id) return;

    try {
      const { error } = await supabase
        .from("salary_history")
        .insert({
          team_member_id: id,
          amount: parseFloat(values.amount),
          start_date: values.start_date,
          end_date: values.end_date,
        })

      if (error) throw error

      await refetchSalaryHistory()

      toast({
        title: "Success",
        description: "Salary history updated successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  async function onSubmit(values: TeamMemberFormSchema) {
    if (!session?.user.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to perform this action",
      })
      return
    }

    try {
      const teamMemberData = {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        personal_phone: values.personal_phone || null,
        personal_email: values.personal_email || null,
        company_phone: values.company_phone || null,
        company_email: values.company_email || null,
        type: values.type,
        left_company: values.left_company,
        user_id: session.user.id,
      }

      console.log("Submitting data:", teamMemberData)

      if (id && id !== 'new') {
        // Update existing team member
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .update(teamMemberData)
          .eq("id", id)

        if (teamMemberError) {
          console.error("Update error:", teamMemberError)
          throw teamMemberError
        }

        // Only add salary if amount is provided
        if (values.salary.amount) {
          const { error: salaryError } = await supabase
            .from("salary_history")
            .insert({
              team_member_id: id,
              amount: parseFloat(values.salary.amount),
              start_date: values.salary.start_date,
              end_date: values.salary.end_date,
            })

          if (salaryError) throw salaryError
        }
      } else {
        // Insert new team member
        const { data: newMember, error: teamMemberError } = await supabase
          .from("team_members")
          .insert(teamMemberData)
          .select()
          .single()

        if (teamMemberError) {
          console.error("Insert error:", teamMemberError)
          throw teamMemberError
        }

        // Only add salary if amount is provided
        if (values.salary.amount && newMember) {
          const { error: salaryError } = await supabase
            .from("salary_history")
            .insert({
              team_member_id: newMember.id,
              amount: parseFloat(values.salary.amount),
              start_date: values.salary.start_date,
              end_date: values.salary.end_date,
            })

          if (salaryError) throw salaryError
        }
      }

      navigate("/team")
      toast({
        title: "Success",
        description: `Team member successfully ${id && id !== 'new' ? "updated" : "added"}`,
      })
    } catch (error: any) {
      console.error("Error in onSubmit:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  if (isMemberLoading || isSalaryLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{id === 'new' ? 'Add' : 'Edit'} Team Member</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/team")}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <TeamMemberForm
          member={member}
          userId={session?.user.id || ""}
          onSubmit={onSubmit}
          mode={id === 'new' ? 'new' : 'edit'}
        />

        {id !== 'new' && (
          <SalaryHistory 
            id={id} 
            salaryHistory={salaryHistory} 
            handleAddSalary={handleAddSalary} 
          />
        )}
      </div>
    </div>
  )
}
