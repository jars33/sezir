import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { variableCostService } from "@/services/supabase"

const variableCostFormSchema = z.object({
  month: z.string().min(1, "Month is required"),
  endMonth: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
})

type VariableCostFormSchema = z.infer<typeof variableCostFormSchema>

export interface CostItem {
  id: string
  month: string
  amount: number
  description?: string
  isCalculated?: boolean
}

interface ProjectVariableCostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (values: { month: string; amount: string; description: string }) => void
  defaultValues?: Partial<VariableCostFormSchema>
  showDelete?: boolean
  onDelete?: () => void
  projectId: string
  existingCost?: CostItem
  onSuccess?: () => Promise<void>
}

export function ProjectVariableCostDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  showDelete,
  onDelete,
  projectId,
  existingCost,
  onSuccess,
}: ProjectVariableCostDialogProps) {
  const [isPeriod, setIsPeriod] = useState(false)
  const { t } = useTranslation()

  const form = useForm<VariableCostFormSchema>({
    resolver: zodResolver(variableCostFormSchema),
    defaultValues: {
      month: existingCost?.month || defaultValues?.month || "",
      endMonth: defaultValues?.endMonth || "",
      amount: existingCost ? String(existingCost.amount) : defaultValues?.amount || "",
      description: existingCost?.description || defaultValues?.description || "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        month: existingCost?.month || defaultValues?.month || "",
        endMonth: defaultValues?.endMonth || "",
        amount: existingCost ? String(existingCost.amount) : defaultValues?.amount || "",
        description: existingCost?.description || defaultValues?.description || "",
      })
      setIsPeriod(false)
    }
  }, [open, defaultValues, existingCost, form])

  const handleSubmit = async (values: VariableCostFormSchema) => {
    try {
      if (onSubmit) {
        if (!isPeriod) {
          onSubmit({
            month: values.month,
            amount: values.amount,
            description: values.description,
          })
          return
        }

        const startDate = new Date(values.month)
        const endDate = new Date(values.endMonth || values.month)

        if (endDate < startDate) {
          form.setError("endMonth", {
            type: "manual",
            message: "End month must be after start month",
          })
          return
        }

        startDate.setDate(1)
        endDate.setDate(1)
        
        endDate.setMonth(endDate.getMonth() + 1)

        const months: Date[] = []
        let currentDate = new Date(startDate)
        while (currentDate < endDate) {
          months.push(new Date(currentDate))
          currentDate.setMonth(currentDate.getMonth() + 1)
        }

        months.forEach((month) => {
          const monthStr = month.toISOString().slice(0, 7)
          onSubmit({
            month: monthStr,
            amount: values.amount,
            description: values.description,
          })
        })
      } else if (existingCost) {
        await variableCostService.updateVariableCost(
          existingCost.id,
          values.month + "-01",
          Number(values.amount),
          values.description
        );
        
        if (onSuccess) await onSuccess()
        onOpenChange(false)
      } else {
        await variableCostService.createVariableCost(
          projectId,
          values.month + "-01",
          Number(values.amount),
          values.description
        );
        
        if (onSuccess) await onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      toast.error("Failed to save variable cost")
      console.error(error)
    }
  }

  const isEditing = !!existingCost || !!showDelete

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('costs.editCost') : t('costs.variableCost')}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edit variable cost details"
              : "Add variable cost for a single month or a period"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!isEditing && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="period"
                  checked={isPeriod}
                  onCheckedChange={(checked) => setIsPeriod(checked === true)}
                />
                <label
                  htmlFor="period"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Period
                </label>
              </div>
            )}

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isPeriod ? "Start Month" : "Month"}</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPeriod && (
              <FormField
                control={form.control}
                name="endMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Month</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter cost description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              {showDelete && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="sm:mr-auto"
                >
                  Delete Variable Cost
                </Button>
              )}
              <Button type="submit">
                {isEditing ? "Update" : "Add"} Variable Cost
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
