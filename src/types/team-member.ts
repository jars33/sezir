
export type TeamMember = {
  id: string
  name: string
  start_date: string
  end_date: string | null
  company_phone: string | null
  company_email: string | null
  type: "contract" | "external"
  left_company: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export type SalaryHistory = {
  id: string
  team_member_id: string
  amount: number
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

export type TeamMemberFormValues = Omit<
  TeamMember,
  "id" | "created_at" | "updated_at"
>
