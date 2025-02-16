
import { useState, useEffect } from "react"
import { format } from "date-fns"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

const allocationFormSchema = z.object({
  projectId: z.string().min(1, "Please select a project"),
  startMonth: z.date(),
  endMonth: z.date().optional(),
  allocation: z.string().refine(
    (val) => {
      const num = parseInt(val)
      return !isNaN(num) && num >= 0 && num <= 100
    },
    {
      message: "Allocation must be a number between 0 and 100",
    }
  ),
})

type AllocationFormValues = z.infer<typeof allocationFormSchema>

interface TeamMemberAllocationDialogProps {
  teamMemberId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { projectId: string; month: Date; allocation: string }) => Promise<void>
}

export function TeamMemberAllocationDialog({
  teamMemberId,
  open,
  onOpenChange,
  onSubmit,
}: TeamMemberAllocationDialogProps) {
  const [isPeriod, setIsPeriod] = useState(false)
  
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      allocation: "100",
      startMonth: new Date(),
    },
  })

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, number")
        .order("number")

      if (error) throw error
      return data
    },
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        allocation: "100",
        startMonth: new Date(),
      })
      setIsPeriod(false)
    }
  }, [open, form])

  const handleSubmit = async (values: AllocationFormValues) => {
    const startDate = new Date(values.startMonth)
    const endDate = isPeriod ? new Date(values.endMonth || values.startMonth) : startDate

    if (isPeriod && endDate < startDate) {
      form.setError("endMonth", {
        type: "manual",
        message: "End month must be after start month",
      })
      return
    }

    // Set dates to first of month for accurate month calculations
    startDate.setDate(1)
    endDate.setDate(1)
    
    const months: Date[] = []
    let currentDate = new Date(startDate)
    
    // Include all months up to and including the end month
    while (currentDate <= endDate) {
      months.push(new Date(currentDate))
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Submit allocations for each month in the period
    for (const month of months) {
      await onSubmit({
        projectId: values.projectId,
        month,
        allocation: values.allocation,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member Allocation</DialogTitle>
          <DialogDescription>
            Add allocation for a single month or a period
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
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.number} - {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isPeriod ? "Start Month" : "Month"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="month" 
                      onChange={(e) => {
                        const date = new Date(e.target.value + "-01")
                        field.onChange(date)
                      }}
                      value={field.value ? format(field.value, "yyyy-MM") : ""}
                    />
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
                      <Input 
                        type="month" 
                        onChange={(e) => {
                          const date = new Date(e.target.value + "-01")
                          field.onChange(date)
                        }}
                        value={field.value ? format(field.value, "yyyy-MM") : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="allocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation Percentage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      min="0"
                      max="100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Add Allocation</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
