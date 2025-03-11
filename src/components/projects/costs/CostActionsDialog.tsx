
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit2Icon, Trash2Icon } from "lucide-react"

interface CostActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  type: "variable" | "overhead"
  amount: number
  month: string
}

export function CostActionsDialog({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  type,
  amount,
  month,
}: CostActionsDialogProps) {
  // Add a guard clause to prevent rendering if required props are missing
  if (amount === undefined || month === undefined) {
    return null;
  }

  const formattedMonth = new Date(month).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === "variable" ? "Variable" : "Overhead"} Cost Actions</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="mb-6 text-center">
            <div className="text-2xl font-semibold">€{amount.toFixed(2)}</div>
            <div className="text-sm text-gray-500">{formattedMonth}</div>
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
              Edit Cost
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
              Delete Cost
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
