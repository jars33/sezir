
import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/AuthProvider"
import { useTeamMember } from "@/hooks/use-team-member"
import { useManagedTeamMembers } from "@/hooks/use-managed-team-members"
import { AddTeamMember } from "@/components/team/AddTeamMember"
import { EditTeamMember } from "@/components/team/EditTeamMember"

export default function TeamMemberDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  
  // Special case for the 'new' route - always allow access
  const isNewMember = id === 'new'
  
  // IMPORTANT: For new members, don't fetch any data
  // This prevents unnecessary queries and access checks
  const { 
    member, 
    salaryHistory, 
    isMemberLoading, 
    isSalaryLoading, 
    refetchSalaryHistory 
  } = useTeamMember(isNewMember ? undefined : id)
  
  const { data: managedMembers, isLoading: isManagedMembersLoading } = useManagedTeamMembers()
  
  // If it's a new member, render the AddTeamMember component immediately
  // without waiting for any data loading or access checks
  if (isNewMember) {
    if (!session?.user?.id) {
      return <div className="p-8">Please log in to add team members.</div>
    }
    console.log("Rendering AddTeamMember component for new member")
    return <AddTeamMember userId={session.user.id} />
  }
  
  const canAccessMember = React.useMemo(() => {
    // Only apply access checks for existing members, not new ones
    if (!id || !managedMembers) return false
    
    const memberId = id.toString()
    // Check if the user has access to this team member
    return managedMembers.some(managedMember => managedMember.id === memberId)
  }, [id, managedMembers])

  useEffect(() => {
    // Skip access check for the 'new' route completely
    if (isNewMember) return;
    
    // Only check access after managed members have loaded
    if (!isManagedMembersLoading && !isMemberLoading && !canAccessMember) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view or edit this team member",
      })
      navigate("/team")
    }
  }, [canAccessMember, isManagedMembersLoading, isMemberLoading, navigate, toast, isNewMember])

  // For existing member routes, show loading state or the edit component
  if (isMemberLoading || isSalaryLoading || isManagedMembersLoading) {
    return <div className="p-8">Loading...</div>
  }

  // Additional safety check - if access is denied, return null
  if (!canAccessMember) {
    return null
  }

  return (
    <EditTeamMember
      id={id || ""}
      member={member}
      salaryHistory={salaryHistory}
      userId={session?.user.id || ""}
      refetchSalaryHistory={refetchSalaryHistory}
    />
  )
}
