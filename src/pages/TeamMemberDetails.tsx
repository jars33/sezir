
import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TeamMemberForm } from "@/components/team/TeamMemberForm"
import { EditTeamMember } from "@/components/team/EditTeamMember"
import { AddTeamMember } from "@/components/team/AddTeamMember"
import { useTeamMember } from "@/hooks/use-team-member"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"

export default function TeamMemberDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  const userId = session?.user?.id

  console.log("🔍 TeamMemberDetails.tsx - Rendering with id:", id)
  console.log("🔍 TeamMemberDetails.tsx - Session user id:", userId)
  
  // Check if this is the "new" route
  const isNewMember = id === "new"
  console.log("🔍 TeamMemberDetails.tsx - Is new member route:", isNewMember)

  // Only fetch team member data if not on the "new" route
  const { 
    member, 
    salaryHistory,
    isMemberLoading,
    isSalaryLoading,
    refetchSalaryHistory
  } = useTeamMember(isNewMember ? undefined : id)

  console.log("🔍 TeamMemberDetails.tsx - Member data:", member)
  console.log("🔍 TeamMemberDetails.tsx - Loading states:", { isMemberLoading, isSalaryLoading })

  if (!userId) {
    console.log("⚠️ TeamMemberDetails.tsx - No user ID available")
    toast({
      variant: "destructive",
      title: "Error",
      description: "You must be logged in to view this page",
    })
    navigate("/auth")
    return null
  }

  // Handle the "new" route
  if (isNewMember) {
    console.log("📝 TeamMemberDetails.tsx - Rendering AddTeamMember component")
    return <AddTeamMember userId={userId} />
  }

  // Handle loading states for edit route
  if (isMemberLoading || isSalaryLoading) {
    console.log("⏳ TeamMemberDetails.tsx - Loading data...")
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Team Member Details</h1>
          <Button variant="outline" onClick={() => navigate("/team")}>
            Back to List
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading team member data...</p>
        </div>
      </div>
    )
  }

  // Handle case where ID is provided but member not found
  if (!isNewMember && !member) {
    console.log("❌ TeamMemberDetails.tsx - Team member not found")
    toast({
      variant: "destructive",
      title: "Error",
      description: "Team member not found",
    })
    navigate("/team")
    return null
  }

  console.log("📝 TeamMemberDetails.tsx - Rendering EditTeamMember component")
  // At this point we know we have a valid team member to edit
  return (
    <EditTeamMember
      id={id!}
      member={member}
      salaryHistory={salaryHistory}
      userId={userId}
      refetchSalaryHistory={refetchSalaryHistory}
    />
  )
}
