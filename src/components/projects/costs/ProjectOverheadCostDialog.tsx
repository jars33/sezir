
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

const overheadCostFormSchema = z.object({
  month: z.string().min(1, "Month is required"),
  amount: z.string().min(1, "Amount is required"),
})

type OverheadCostFormSchema = z.infer<typeof overheadCostFormSchema>

interface ProjectOverheadCostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: OverheadCostFormSchema) => void
  defaultValues?: Partial<OverheadCostFormSchema>
}

export function ProjectOverheadCostDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ProjectOverheadCostDialogProps) {
  const form = useForm<OverheadCostFormSchema>({
    resolver: zodResolver(overheadCostFormSchema),
    defaultValues: {
      month: defaultValues?.month || "",
      amount: defaultValues?.amount || "",
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Overhead Cost" : "Add Overhead Cost"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
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
            <div className="flex justify-end">
              <Button type="submit">
                {defaultValues ? "Update" : "Add"} Overhead Cost
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
