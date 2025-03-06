
import * as z from "zod"

export const allocationFormSchema = z.object({
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

export type AllocationFormValues = z.infer<typeof allocationFormSchema>
