
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
import { useTranslation } from "react-i18next"

interface DeleteTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  projectCount?: number
}

export function DeleteTeamDialog({
  open,
  onOpenChange,
  onConfirm,
  projectCount = 0,
}: DeleteTeamDialogProps) {
  const { t } = useTranslation()
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {projectCount > 0 ? (
              <>{t('team.deleteTeamWithProjects', {
                count: projectCount,
                defaultValue: `This will permanently delete the team and unlink {{count}} associated project(s).`
              })}</>
            ) : (
              <>{t('team.deleteTeamConfirmation', {
                defaultValue: "This action cannot be undone. This will permanently delete the team and all of its associated data."
              })}</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('common.delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
