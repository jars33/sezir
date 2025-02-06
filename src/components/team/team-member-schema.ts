
import * as z from "zod"

export const teamMemberFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  salary: z.string().min(1, "Salary is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable(),
  personal_phone: z.string().nullable(),
  personal_email: z.string().email().nullable(),
  company_phone: z.string().nullable(),
  company_email: z.string().email().nullable(),
  type: z.enum(["contract", "external"]),
  left_company: z.boolean(),
  user_id: z.string(),
})

export type TeamMemberFormSchema = z.infer<typeof teamMemberFormSchema>
