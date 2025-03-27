
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import type { TeamMember } from "@/types/team-member"

export function useTeamMemberDelete(onSuccess: () => void) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)
  const [isReferencedByTeam, setIsReferencedByTeam] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!memberToDelete) return

    try {
      // First check if this team member is a manager of any team
      const { data: managedTeams, error: teamCheckError } = await supabase
        .from("teams")
        .select("id, name")
        .eq("manager_id", memberToDelete.id)

      if (teamCheckError) {
        console.error("Error checking if member manages teams:", teamCheckError)
        throw teamCheckError
      }

      // If the member manages any teams, show an error
      if (managedTeams && managedTeams.length > 0) {
        setIsReferencedByTeam(true)
        toast({
          variant: "destructive",
          title: "Cannot delete team member",
          description: `This person is a manager of ${managedTeams.length} team(s). Please assign a different manager first.`,
        })
        return
      }
      
      // If there's a company email, delete the corresponding user account first
      if (memberToDelete.company_email) {
        console.log("Attempting to delete user account with email:", memberToDelete.company_email)
        
        const { error: userDeleteError } = await supabase.functions.invoke('delete-user', {
          body: { email: memberToDelete.company_email }
        })
        
        if (userDeleteError) {
          console.error("Error deleting user account:", userDeleteError)
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Team member deleted but failed to delete user account",
          })
        } else {
          console.log("Successfully requested user account deletion")
        }
      }
      
      // Delete the team member record
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberToDelete.id)

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete team member: " + error.message,
        })
        return
      }

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      })
      
      onSuccess()
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
      setIsReferencedByTeam(false)
    } catch (error: any) {
      console.error("Error in delete process:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      })
    }
  }

  const confirmDelete = async (member: TeamMember) => {
    setMemberToDelete(member)
    
    // Check if this member manages any teams before showing the dialog
    const { data: managedTeams, error: teamCheckError } = await supabase
      .from("teams")
      .select("id")
      .eq("manager_id", member.id)
    
    if (teamCheckError) {
      console.error("Error checking if member manages teams:", teamCheckError)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not verify team manager status: " + teamCheckError.message,
      })
      return
    }
    
    if (managedTeams && managedTeams.length > 0) {
      setIsReferencedByTeam(true)
      toast({
        variant: "destructive",
        title: "Cannot delete team member",
        description: `This person is a manager of ${managedTeams.length} team(s). Please assign a different manager first.`,
      })
      return
    }
    
    setIsReferencedByTeam(false)
    setDeleteDialogOpen(true)
  }

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    memberToDelete,
    isReferencedByTeam,
    handleDelete,
    confirmDelete
  }
}
