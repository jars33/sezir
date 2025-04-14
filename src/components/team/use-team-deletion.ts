
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { teamsService } from "@/services/supabase/teams-service"

export function useTeamDeletion() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  
  async function handleDeleteTeam(id: string) {
    if (!id || id === "new") return

    try {
      await teamsService.deleteTeam(id)
      
      navigate("/teams")
      toast({
        title: "Success",
        description: "Team deleted successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }
  
  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteTeam
  }
}
