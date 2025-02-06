
export type TeamMember = {
  id: string
  name: string
  salary: number
  entry_month: string
  entry_year: number
  personal_phone: string | null
  personal_email: string | null
  company_phone: string | null
  company_email: string | null
  status: string
  type: "contract" | "external"
  left_company: boolean
  created_at: string
  updated_at: string
}

export type TeamMemberFormValues = Omit<
  TeamMember,
  "id" | "created_at" | "updated_at"
>
