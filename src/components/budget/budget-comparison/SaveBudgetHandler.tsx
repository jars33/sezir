
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Loader2, Check, X } from "lucide-react";

interface SaveBudgetHandlerProps {
  onSave: (description: string, projectId?: string) => Promise<string | null>;
  onSuccess?: (budgetId: string) => void;
}

export const useSaveBudgetHandler = ({ onSave, onSuccess }: SaveBudgetHandlerProps) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (description: string, selectedProjectId?: string) => {
    const projectIdToSave = selectedProjectId === 'none' ? undefined : selectedProjectId;
    
    if (isSaving) {
      toast.info(t('budget.alreadySaving'), {
        description: t('budget.pleasewait')
      });
      return;
    }
    
    setIsSaving(true);
    
    const toastId = toast.loading(t('budget.saving'), {
      description: t('budget.pleasewait'),
      icon: <Loader2 className="h-4 w-4 animate-spin" />
    });
    
    try {
      const budgetId = await onSave(description, projectIdToSave);
      
      if (budgetId) {
        toast.dismiss(toastId);
        toast.success(t('budget.budgetSaved'), {
          description: description,
          icon: <Check className="h-4 w-4" />
        });
        
        if (onSuccess) {
          onSuccess(budgetId);
        }
      } else {
        toast.dismiss(toastId);
        toast.error(t('budget.errorSavingBudget'), {
          description: t('budget.pleaseTryAgain'),
          icon: <X className="h-4 w-4" />
        });
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.dismiss(toastId);
      toast.error(t('budget.errorSavingBudget'), {
        description: error instanceof Error ? error.message : t('budget.unknownError'),
        icon: <X className="h-4 w-4" />
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSave,
    isSaving
  };
};
