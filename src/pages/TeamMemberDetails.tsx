
import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/AuthProvider"
import { useTeamMember } from "@/hooks/use-team-member"
import { AddTeamMember } from "@/components/team/AddTeamMember"
import { EditTeamMember } from "@/components/team/EditTeamMember"

export default function TeamMemberDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  
  console.log("🔍 TeamMemberDetails - Rendering with id:", id)
  console.log("🔍 TeamMemberDetails - Session:", session)
  
  // Make sure we have a session
  if (!session?.user?.id) {
    console.log("⚠️ TeamMemberDetails - No session available, redirecting to login")
    return <div className="p-8">Please log in to add or edit team members.</div>
  }
  
  console.log("✅ TeamMemberDetails - Session available, user ID:", session.user.id)
  
  // Special case for the 'new' route - always allow access
  const isNewMember = id === 'new'
  console.log("🔍 TeamMemberDetails - isNewMember:", isNewMember)
  
  // If it's a new member, render the AddTeamMember component immediately
  if (isNewMember) {
    console.log("🆕 TeamMemberDetails - Rendering AddTeamMember for new member")
    return <AddTeamMember userId={session.user.id} />
  }
  
  console.log("📊 TeamMemberDetails - Fetching existing member data for ID:", id)
  
  // For existing members, fetch data
  const { 
    member, 
    salaryHistory, 
    isMemberLoading, 
    isSalaryLoading, 
    refetchSalaryHistory 
  } = useTeamMember(id)
  
  console.log("📊 TeamMemberDetails - Member data:", member)
  console.log("📊 TeamMemberDetails - Salary history:", salaryHistory)
  console.log("📊 TeamMemberDetails - Loading states:", { isMemberLoading, isSalaryLoading })
  
  // Show loading state while data is being fetched
  if (isMemberLoading || isSalaryLoading) {
    console.log("⏳ TeamMemberDetails - Still loading data...")
    return <div className="p-8">Loading...</div>
  }
  
  // For existing members, we need to make sure we have a valid ID
  if (!id || id === 'undefined') {
    console.error("❌ TeamMemberDetails - No team member ID found")
    toast({
      variant: "destructive",
      title: "Error",
      description: "No team member ID found"
    })
    navigate("/team")
    return null
  }

  console.log("✅ TeamMemberDetails - Rendering EditTeamMember with data")
  
  return (
    <EditTeamMember
      id={id}
      member={member}
      salaryHistory={salaryHistory}
      userId={session.user.id}
      refetchSalaryHistory={refetchSalaryHistory}
    />
  )
}
