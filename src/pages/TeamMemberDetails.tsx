
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
  const { member, salaryHistory, isMemberLoading, isSalaryLoading, refetchSalaryHistory } = useTeamMember(id)
  const { data: managedMembers, isLoading: isManagedMembersLoading } = useManagedTeamMembers()
  
  // Special case: Always allow access to the 'new' route
  const isNewMember = id === 'new'
  
  const canAccessMember = React.useMemo(() => {
    // Always allow access to the 'new' route
    if (isNewMember) return true
    
    if (!id || !managedMembers) return false
    
    const memberId = id.toString()
    // Check if the user has access to this team member
    return managedMembers.some(managedMember => managedMember.id === memberId)
  }, [id, managedMembers, isNewMember])

  useEffect(() => {
    // Skip access check entirely for the 'new' route
    if (isNewMember) return;
    
    // Only redirect if we've loaded managed members, the member isn't loading, 
    // and the user doesn't have access to this specific member
    if (!isManagedMembersLoading && !isMemberLoading && !canAccessMember) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view or edit this team member",
      })
      navigate("/team")
    }
  }, [canAccessMember, isManagedMembersLoading, isMemberLoading, navigate, toast, id, isNewMember])

  // For the 'new' route, always render immediately
  if (isNewMember) {
    return <AddTeamMember userId={session?.user.id || ""} />
  }

  // For existing member routes, show loading state or deny access
  if (isMemberLoading || isSalaryLoading || isManagedMembersLoading) {
    return <div className="p-8">Loading...</div>
  }

  // If access is denied, this will be caught by the useEffect above
  // but we add an additional check here just to be safe
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
