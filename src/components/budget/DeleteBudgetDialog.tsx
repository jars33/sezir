
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface DeleteBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  description?: string;
}

export function DeleteBudgetDialog({
  open,
  onOpenChange,
  onConfirm,
  description,
}: DeleteBudgetDialogProps) {
  const { t } = useTranslation();
  
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
      toast.success(t('budget.deletedSuccess'));
    } catch (error) {
      console.error("Error deleting budget comparison:", error);
      toast.error(t('budget.errorDeleting'));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialog.areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('budget.deleteWarning')} 
            {description && (
              <span className="font-semibold block mt-2">"{description}"</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('dialog.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
