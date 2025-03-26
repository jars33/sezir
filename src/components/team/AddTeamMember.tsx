
import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TeamMemberForm } from "@/components/team/TeamMemberForm"
import { useTeamMemberSubmit } from "./TeamMemberSubmitHandler"
import type { TeamMemberFormSchema } from "./team-member-schema"
import { useToast } from "@/hooks/use-toast"

interface AddTeamMemberProps {
  userId: string
}

export function AddTeamMember({ userId }: AddTeamMemberProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { handleSubmit } = useTeamMemberSubmit()

  const onSubmit = async (values: TeamMemberFormSchema) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user ID available. Please log in again."
      })
      return
    }
    
    console.log("Submitting new team member with user ID:", userId)
    try {
      await handleSubmit(values, true, undefined, userId)
      toast({
        title: "Success",
        description: "Team member successfully added",
      })
      navigate("/team")
    } catch (error: any) {
      console.error("Error adding team member:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add team member",
      })
    }
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
