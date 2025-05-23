
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit2Icon, Trash2Icon } from "lucide-react"
import { useTranslation } from "react-i18next"

interface CostActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  type: "variable" | "overhead"
  amount: number
  month: string
  description?: string
}

export function CostActionsDialog({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  type,
  amount,
  month,
  description,
}: CostActionsDialogProps) {
  const { t } = useTranslation();
  
  // Add a guard clause to prevent rendering if required props are missing
  if (amount === undefined || month === undefined) {
    return null;
  }

  const formattedMonth = new Date(month).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  })

  const costType = type === "variable" ? t('costs.variableCost') : t('costs.overheadCost');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{costType} {t('costs.actions')}</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="mb-6 text-center">
            <div className="text-2xl font-semibold">€{amount.toFixed(2)}</div>
            <div className="text-sm text-gray-500">{formattedMonth}</div>
            {description && <div className="text-sm mt-1">{description}</div>}
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onEdit()
                onOpenChange(false)
              }}
            >
              <Edit2Icon className="mr-2 h-4 w-4" />
              {t('costs.editCost')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                onDelete()
                onOpenChange(false)
              }}
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              {t('costs.deleteCost')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
