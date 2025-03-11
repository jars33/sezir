
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

interface DeleteCostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  type: "variable" | "overhead" | "revenue"
  cost_id?: string // Made optional since we're not using it in the current component
}

export function DeleteCostDialog({
  open,
  onOpenChange,
  onConfirm,
  type,
}: DeleteCostDialogProps) {
  const { t } = useTranslation();
  
  // Determine the type text and entry type for the message
  const getTypeTranslation = () => {
    switch(type) {
      case "variable": return t('costs.variableCost');
      case "overhead": return t('costs.overheadCost');
      case "revenue": return t('costs.revenue');
      default: return type;
    }
  };
  
  const entryType = type === 'revenue' ? t('costs.entry') : t('costs.cost');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialog.areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('costs.deleteWarning', { type: getTypeTranslation().toLowerCase(), entryType })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('dialog.delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
