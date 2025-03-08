
import * as z from "zod"

export const projectFormSchema = z.object({
  number: z.string().min(1, "Project number is required"),
  name: z.string().min(1, "Project name is required"),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  team_id: z.string().nullable(),
})

export type ProjectFormSchema = z.infer<typeof projectFormSchema>
