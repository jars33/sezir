
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TeamMemberBasicFields } from "./TeamMemberBasicFields"
import { TeamMemberContactFields } from "./TeamMemberContactFields"
import { teamMemberFormSchema, type TeamMemberFormSchema } from "./team-member-schema"
import type { TeamMember } from "@/types/team-member"
import { useTranslation } from "react-i18next"

interface TeamMemberFormProps {
  member: TeamMember | null
  userId: string
  onSubmit: (values: TeamMemberFormSchema) => Promise<void>
  mode: "new" | "edit"
}

export function TeamMemberForm({ member, userId, onSubmit, mode }: TeamMemberFormProps) {
  const { t } = useTranslation()
  
  const form = useForm<TeamMemberFormSchema>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: null,
      company_phone: null,
      company_email: null,
      type: "contract",
      left_company: false,
      user_id: userId,
    },
  })

  React.useEffect(() => {
    if (member) {
      console.log("Resetting form with member data:", member)
      form.reset({
        name: member.name || "",
        start_date: member.start_date || format(new Date(), 'yyyy-MM-dd'),
        end_date: member.end_date,
        company_phone: member.company_phone,
        company_email: member.company_email,
        type: member.type || "contract",
        left_company: member.left_company || false,
        user_id: userId,
      })
    }
  }, [member, userId, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TeamMemberBasicFields form={form} />
        <TeamMemberContactFields form={form} />
        <div className="flex justify-end">
          <Button type="submit">
            {mode === "new" 
              ? t('team.addTeamMember', "Add Team Member") 
              : t('team.updateTeamMember', "Update Team Member")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
