
import { useState, useEffect } from "react"
import { format } from "date-fns"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { TeamMemberSelectField } from "../TeamMemberSelectField"

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
  const { t } = useTranslation()
  
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
        message: t('team.endMonthError'),
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

      toast.success(t('common.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ["project-allocations"] })
      onOpenChange(false)
    } catch (error: any) {
      toast.error(t('common.deleteError'))
      console.error("Error deleting allocation:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Determine if this is an edit or add operation
  const isEditing = !!initialAllocation

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('team.editAllocation') : t('team.addMemberAllocation')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('team.editAllocationDescription') : t('team.addAllocationDescription')}
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
                  {t('team.period')}
                </label>
              </div>
            )}

            <TeamMemberSelectField 
              control={form.control} 
              teamMembers={teamMembers}
              disabled={isEditing}
            />

            <FormField
              control={form.control}
              name="startMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isPeriod ? t('team.startMonth') : t('common.month')}</FormLabel>
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
                    <FormLabel>{t('team.endMonth')}</FormLabel>
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
                  <FormLabel>{t('team.allocationPercentage')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      onChange={(e) => handleAllocationChange(e, field)}
                      value={field.value}
                      placeholder={t('team.allocationPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {initialAllocation && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {t('common.deleteAllocation')}
                </Button>
              )}
              <Button type="submit">
                {isEditing ? t('common.update') : t('common.add')} {t('common.allocation')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
