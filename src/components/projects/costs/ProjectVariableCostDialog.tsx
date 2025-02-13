
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

const variableCostFormSchema = z.object({
  month: z.string().min(1, "Month is required"),
  endMonth: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
})

type VariableCostFormSchema = z.infer<typeof variableCostFormSchema>

interface ProjectVariableCostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { month: string; amount: string; description: string }) => void
  defaultValues?: Partial<VariableCostFormSchema>
}

export function ProjectVariableCostDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ProjectVariableCostDialogProps) {
  const [isPeriod, setIsPeriod] = useState(false)

  const form = useForm<VariableCostFormSchema>({
    resolver: zodResolver(variableCostFormSchema),
    defaultValues: {
      month: defaultValues?.month || "",
      endMonth: defaultValues?.endMonth || "",
      amount: defaultValues?.amount || "",
      description: defaultValues?.description || "",
    },
  })

  const handleSubmit = (values: VariableCostFormSchema) => {
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

    // Set dates to first of month for accurate month calculations
    startDate.setDate(1)
    endDate.setDate(1)
    
    // Add one month to end date to include the end month itself
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Variable Cost" : "Add Variable Cost"}
          </DialogTitle>
          <DialogDescription>
            Add variable cost for a single month or a period
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <div className="flex justify-end">
              <Button type="submit">
                {defaultValues ? "Update" : "Add"} Variable Cost
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
