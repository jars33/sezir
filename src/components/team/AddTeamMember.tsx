
import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TeamMemberForm } from "@/components/team/TeamMemberForm"
import { useTeamMemberSubmit } from "./TeamMemberSubmitHandler"
import type { TeamMemberFormSchema } from "./team-member-schema"

interface AddTeamMemberProps {
  userId: string
}

export function AddTeamMember({ userId }: AddTeamMemberProps) {
  const navigate = useNavigate()
  const { handleSubmit } = useTeamMemberSubmit()

  const onSubmit = async (values: TeamMemberFormSchema) => {
    if (!userId) {
      console.error("No user ID provided to AddTeamMember")
      return
    }
    
    console.log("Submitting new team member with user ID:", userId)
    await handleSubmit(values, true, undefined, userId)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Add Team Member</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/team")}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <TeamMemberForm
          member={null}
          userId={userId}
          onSubmit={onSubmit}
          mode="new"
        />
      </div>
    </div>
  )
}
