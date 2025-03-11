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
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export interface CostItem {
  id: string
  month: string
  amount: number
  description?: string
  isCalculated?: boolean
}

interface DeleteCostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: () => void
  type: "variable" | "overhead" | "revenue"
  cost_id?: string 
  cost?: CostItem
  costType?: string
  projectId?: string
  onSuccess?: () => Promise<void>
}

export function DeleteCostDialog({
  open,
  onOpenChange,
  onConfirm,
  type,
  cost,
  projectId,
  onSuccess,
}: DeleteCostDialogProps) {
  const { t } = useTranslation();
  
  const getTypeTranslation = () => {
    switch(type) {
      case "variable": return t('costs.variableCost');
      case "overhead": return t('costs.overheadCost');
      case "revenue": return t('costs.revenue');
      default: return type;
    }
  };
  
  const entryType = type === 'revenue' ? t('costs.entry') : t('costs.cost');

  const handleConfirm = async () => {
    if (onConfirm) {
      onConfirm();
      return;
    }

    try {
      if (!cost || !cost.id) {
        toast.error("No cost to delete");
        return;
      }

      let tableName: "project_variable_costs" | "project_revenues";
      switch (type) {
        case "variable":
          tableName = "project_variable_costs";
          break;
        case "revenue":
          tableName = "project_revenues";
          break;
        default:
          toast.error("Invalid cost type");
          return;
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", cost.id);

      if (error) throw error;

      if (onSuccess) await onSuccess();
      onOpenChange(false);
      toast.success(`${getTypeTranslation()} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${getTypeTranslation().toLowerCase()}`);
      console.error(error);
    }
  };

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
          <AlertDialogAction onClick={handleConfirm}>{t('dialog.delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
