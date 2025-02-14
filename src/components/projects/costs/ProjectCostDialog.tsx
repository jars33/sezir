
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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"

const costFormSchema = z.object({
  type: z.enum(["variable", "overhead"]),
  month: z.string().min(1, "Month is required"),
  endMonth: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
})

type CostFormSchema = z.infer<typeof costFormSchema>

interface ProjectCostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { type: "variable" | "overhead"; month: string; amount: string; description?: string }) => void
  defaultValues?: Partial<CostFormSchema>
  showDelete?: boolean
  onDelete?: () => void
}

export function ProjectCostDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  showDelete,
  onDelete,
}: ProjectCostDialogProps) {
  const [isPeriod, setIsPeriod] = useState(false)

  const form = useForm<CostFormSchema>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      type: "variable",
      month: "",
      endMonth: "",
      amount: "",
      description: "",
    },
  })

  // Reset form with default values when they change
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues)
      setIsPeriod(false) // Reset period state when editing
    }
  }, [defaultValues, form])

  const handleSubmit = (values: CostFormSchema) => {
    if (!isPeriod) {
      onSubmit({
        type: values.type,
        month: values.month,
        amount: values.amount,
        description: values.type === "variable" ? values.description : undefined,
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
        type: values.type,
        month: monthStr,
        amount: values.amount,
        description: values.type === "variable" ? values.description : undefined,
      })
    })
  }

  const costType = form.watch("type")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Cost" : "Add Cost"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues ? "Edit cost details" : "Add cost for a single month or a period"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Cost Type</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Toggle
                        pressed={field.value === "variable"}
                        onPressedChange={(pressed) => {
                          field.onChange(pressed ? "variable" : "overhead")
                        }}
                        className="hover:bg-red-50 hover:text-red-600 data-[state=on]:bg-red-50 data-[state=on]:text-red-600"
                      >
                        Variable
                      </Toggle>
                      <Toggle
                        pressed={field.value === "overhead"}
                        onPressedChange={(pressed) => {
                          field.onChange(pressed ? "overhead" : "variable")
                        }}
                        className="hover:bg-orange-50 hover:text-orange-600 data-[state=on]:bg-orange-50 data-[state=on]:text-orange-600"
                      >
                        Overhead
                      </Toggle>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!defaultValues && (
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

            {isPeriod && !defaultValues && (
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

            {costType === "variable" && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter cost description" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {showDelete && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="sm:mr-auto"
                >
                  Delete Cost
                </Button>
              )}
              <Button type="submit">
                {defaultValues ? "Update" : "Add"} Cost
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
