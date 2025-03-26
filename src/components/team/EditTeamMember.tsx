
import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TeamMemberForm } from "@/components/team/TeamMemberForm"
import { SalaryHistory } from "@/components/team/salary/SalaryHistory"
import { useTeamMemberSubmit } from "./TeamMemberSubmitHandler"
import { useAddSalary } from "./salary/AddSalaryHandler"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import type { TeamMemberFormSchema } from "./team-member-schema"
import type { TeamMember, SalaryHistory as SalaryHistoryType } from "@/types/team-member"

interface EditTeamMemberProps {
  id: string
  member: TeamMember | null
  salaryHistory: SalaryHistoryType[] | undefined
  userId: string
  refetchSalaryHistory: (options?: RefetchOptions) => Promise<QueryObserverResult<SalaryHistoryType[], Error>>
}

export function EditTeamMember({ 
  id, 
  member, 
  salaryHistory, 
  userId,
  refetchSalaryHistory 
}: EditTeamMemberProps) {
  const navigate = useNavigate()
  const { handleSubmit } = useTeamMemberSubmit()
  const { handleAddSalary, handleEditSalary, handleDeleteSalary } = useAddSalary(refetchSalaryHistory)

  const onSubmit = async (values: TeamMemberFormSchema) => {
    try {
      // Check if we have a valid ID for updating
      if (!id) {
        throw new Error("No team member ID available for update");
      }
      
      await handleSubmit(values, false, id, userId);
      
      navigate("/team");
    } catch (error: any) {
      console.error("Error updating team member:", error);
      throw error;
    }
  }

  const onAddSalary = async (values: { amount: string, start_date: string, end_date: string }) => {
    await handleAddSalary(id, values, false, userId)
  }

  const onEditSalary = async (salaryId: string, values: { amount: string, start_date: string, end_date: string }) => {
    await handleEditSalary(salaryId, values)
  }

  const onDeleteSalary = async (salaryId: string) => {
    await handleDeleteSalary(salaryId)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Team Member</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/team")}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <TeamMemberForm
          member={member}
          userId={userId}
          onSubmit={onSubmit}
          mode="edit"
        />

        <SalaryHistory 
          id={id} 
          salaryHistory={salaryHistory} 
          handleAddSalary={onAddSalary}
          handleEditSalary={onEditSalary}
          handleDeleteSalary={onDeleteSalary}
        />
      </div>
    </div>
  )
}
