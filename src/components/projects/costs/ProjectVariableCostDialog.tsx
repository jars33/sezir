
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

const variableCostFormSchema = z.object({
  startMonth: z.string().min(1, "Start month is required"),
  endMonth: z.string().min(1, "End month is required"),
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
  const form = useForm<VariableCostFormSchema>({
    resolver: zodResolver(variableCostFormSchema),
    defaultValues: {
      startMonth: defaultValues?.startMonth || "",
      endMonth: defaultValues?.endMonth || "",
      amount: defaultValues?.amount || "",
      description: defaultValues?.description || "",
    },
  })

  const handleSubmit = (values: VariableCostFormSchema) => {
    const startDate = new Date(values.startMonth)
    const endDate = new Date(values.endMonth)

    if (endDate < startDate) {
      form.setError("endMonth", {
        type: "manual",
        message: "End month must be after start month",
      })
      return
    }

    const months: Date[] = []
    let currentDate = startDate
    while (currentDate <= endDate) {
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
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="startMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Month</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
