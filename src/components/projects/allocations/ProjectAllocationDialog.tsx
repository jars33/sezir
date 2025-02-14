
import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const allocationFormSchema = z.object({
  teamMemberId: z.string().min(1, "Please select a team member"),
  month: z.date(),
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
  onSubmit: (values: AllocationFormValues) => Promise<void>
  teamMembers: Array<{ id: string; name: string }>
}

export function ProjectAllocationDialog({
  projectId,
  open,
  onOpenChange,
  onSubmit,
  teamMembers,
}: ProjectAllocationDialogProps) {
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      allocation: "100",
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member Allocation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
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
            <FormField
              control={form.control}
              name="allocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation Percentage</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Add Allocation</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
