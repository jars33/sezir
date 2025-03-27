
import { useState } from "react"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DeleteTeamMemberDialog } from "./DeleteTeamMemberDialog"
import type { TeamMember } from "@/types/team-member"

interface TeamMemberListProps {
  members: TeamMember[]
  onEdit: (member: TeamMember) => void
  onSuccess: () => void
}

export function TeamMemberList({ members, onEdit, onSuccess }: TeamMemberListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!memberToDelete) return

    try {
      // If there's a company email, delete the corresponding user account first
      if (memberToDelete.company_email) {
        console.log("Attempting to delete user account with email:", memberToDelete.company_email)
        
        // Use the admin.deleteUser function directly - no need to query auth.users first
        // The function will find the user by email if it exists
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
    } catch (error: any) {
      console.error("Error in delete process:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      })
    }
  }

  const confirmDelete = (member: TeamMember) => {
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy')
    } catch (error) {
      console.error("Error formatting date:", dateString, error)
      return "Invalid date"
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Company Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.name}</TableCell>
              <TableCell className="capitalize">{member.type}</TableCell>
              <TableCell>{member.end_date ? "Inactive" : "Active"}</TableCell>
              <TableCell>{formatDate(member.start_date)}</TableCell>
              <TableCell>{formatDate(member.end_date)}</TableCell>
              <TableCell>{member.company_email || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDelete(member)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteTeamMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        includesUserAccount={memberToDelete?.company_email ? true : false}
      />
    </div>
  )
}
