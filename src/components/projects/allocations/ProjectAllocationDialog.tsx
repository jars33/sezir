
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
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

const allocationFormSchema = z.object({
  teamMemberId: z.string().min(1, "Please select a team member"),
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

interface ProjectAllocationDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { teamMemberId: string; month: Date; allocation: string }) => Promise<void>
  teamMembers: Array<{ id: string; name: string }>
  initialAllocation?: {
    id?: string
    teamMemberId: string
    month: Date
    allocation: string
  }
}

export function ProjectAllocationDialog({
  projectId,
  open,
  onOpenChange,
  onSubmit,
  teamMembers,
  initialAllocation,
}: ProjectAllocationDialogProps) {
  const [isPeriod, setIsPeriod] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()
  
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      allocation: "100",
      startMonth: new Date(),
    },
  })

  // Reset form when dialog opens/closes or initialAllocation changes
  useEffect(() => {
    if (open) {
      if (initialAllocation) {
        form.reset({
          teamMemberId: initialAllocation.teamMemberId,
          startMonth: initialAllocation.month,
          allocation: initialAllocation.allocation,
        })
        setIsPeriod(false) // Disable period selection when editing
      } else {
        form.reset({
          allocation: "100",
          startMonth: new Date(),
        })
      }
    }
  }, [open, initialAllocation, form])

  const handleAllocationChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value
    const numberValue = parseInt(value)
    
    if (value === "") {
      field.onChange("")
      return
    }

    if (isNaN(numberValue)) {
      return
    }

    // Clamp the value between 0 and 100
    const clampedValue = Math.min(Math.max(numberValue, 0), 100)
    field.onChange(clampedValue.toString())
  }

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
        teamMemberId: values.teamMemberId,
        month,
        allocation: values.allocation,
      })
    }
  }

  const handleDelete = async () => {
    if (!initialAllocation?.id) return

    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from("project_member_allocations")
        .delete()
        .eq("id", initialAllocation.id)

      if (error) throw error

      toast.success("Allocation deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["project-allocations"] })
      onOpenChange(false)
    } catch (error: any) {
      toast.error("Failed to delete allocation")
      console.error("Error deleting allocation:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialAllocation ? 'Edit' : 'Add'} Team Member Allocation</DialogTitle>
          <DialogDescription>
            {initialAllocation ? 'Update allocation for this month' : 'Add allocation for a single month or a period'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!initialAllocation && (
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
              name="teamMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
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
                      className="w-full"
                      disabled={!!initialAllocation}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPeriod && !initialAllocation && (
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
                        className="w-full"
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
                      min="0"
                      max="100"
                      step="1"
                      onChange={(e) => handleAllocationChange(e, field)}
                      value={field.value}
                      placeholder="Enter a value between 0 and 100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center">
              {initialAllocation && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Delete Allocation
                </Button>
              )}
              <Button type="submit" className={initialAllocation ? "ml-auto" : ""}>
                {initialAllocation ? 'Update' : 'Add'} Allocation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
