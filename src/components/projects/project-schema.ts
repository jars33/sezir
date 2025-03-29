
import * as z from "zod"
import { type ProjectStatus } from "@/services/supabase/project-service"

export const projectFormSchema = z.object({
  number: z.string().min(1, "Project number is required"),
  name: z.string().min(1, "Project name is required"),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"] as const),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  team_id: z.string().nullable(),
})

export type ProjectFormSchema = z.infer<typeof projectFormSchema>
