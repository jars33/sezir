
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteTeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  includesUserAccount?: boolean
  isReferencedByTeam?: boolean
}

export function DeleteTeamMemberDialog({
  open,
  onOpenChange,
  onConfirm,
  includesUserAccount = false,
  isReferencedByTeam = false,
}: DeleteTeamMemberDialogProps) {
  if (isReferencedByTeam) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              This team member is a manager of one or more teams. Please assign different managers to those teams before deleting this team member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => onOpenChange(false)}>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the team member
            {includesUserAccount && " and their associated user account"}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
