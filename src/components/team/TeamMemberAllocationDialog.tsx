
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { ProjectSelectField } from "./timeline/ProjectSelectField"
import { MonthSelectFields } from "./timeline/MonthSelectFields"
import { AllocationPercentageField } from "./timeline/AllocationPercentageField"
import { useProjectsData } from "./timeline/useProjectsData"
import { useAllocationFormSubmit } from "./timeline/useAllocationFormSubmit"

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
  const { data: projects } = useProjectsData()
  const { form, handleSubmit } = useAllocationFormSubmit({ onSubmit, open })
  
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

            <ProjectSelectField control={form.control} projects={projects} />
            <MonthSelectFields control={form.control} isPeriod={isPeriod} />
            <AllocationPercentageField control={form.control} />

            <Button type="submit">Add Allocation</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
