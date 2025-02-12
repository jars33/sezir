
import { useParams, useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { TeamMemberBasicFields } from "@/components/team/TeamMemberBasicFields"
import { TeamMemberContactFields } from "@/components/team/TeamMemberContactFields"
import { teamMemberFormSchema, type TeamMemberFormSchema } from "@/components/team/team-member-schema"
import type { TeamMember, TeamMemberFormValues } from "@/types/team-member"

export default function TeamMemberDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()

  const { data: member, isLoading } = useQuery({
    queryKey: ["team-member", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data as TeamMember
    },
    enabled: !!id,
  })

  const form = useForm<TeamMemberFormSchema>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      salary: {
        amount: "",
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: null,
      },
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: null,
      personal_phone: null,
      personal_email: null,
      company_phone: null,
      company_email: null,
      type: "contract" as const,
      left_company: false,
      user_id: "",
    },
  })

  useQuery({
    queryKey: ["team-member-salary", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('salary_history')
        .select('*')
        .eq('team_member_id', id)
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        form.setValue("salary.amount", data.amount.toString())
        form.setValue("salary.start_date", data.start_date)
        form.setValue("salary.end_date", data.end_date)
      }
      return data
    },
    enabled: !!id && !!member,
  })

  useQuery({
    queryKey: ["team-member-form", member?.id],
    queryFn: async () => {
      if (!member) return null
      
      form.reset({
        name: member.name,
        start_date: member.start_date,
        end_date: member.end_date,
        personal_phone: member.personal_phone,
        personal_email: member.personal_email,
        company_phone: member.company_phone,
        company_email: member.company_email,
        type: member.type,
        left_company: member.left_company,
        user_id: member.user_id,
        salary: form.getValues("salary"), // Keep existing salary values
      })
      
      return null
    },
    enabled: !!member,
  })

  async function onSubmit(values: TeamMemberFormSchema) {
    if (!session?.user.id) return

    try {
      const teamMemberData: Omit<TeamMemberFormValues, "salary"> = {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        personal_phone: values.personal_phone,
        personal_email: values.personal_email,
        company_phone: values.company_phone,
        company_email: values.company_email,
        type: values.type,
        left_company: values.left_company,
        user_id: session.user.id,
      }

      if (id) {
        // Update existing team member
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .update(teamMemberData)
          .eq("id", id)

        if (teamMemberError) throw teamMemberError

        // Update or insert salary history
        const { error: salaryError } = await supabase
          .from("salary_history")
          .insert({
            team_member_id: id,
            amount: parseFloat(values.salary.amount),
            start_date: values.salary.start_date,
            end_date: values.salary.end_date,
          })

        if (salaryError) throw salaryError
      } else {
        // Insert new team member
        const { data: newMember, error: teamMemberError } = await supabase
          .from("team_members")
          .insert(teamMemberData)
          .select()
          .single()

        if (teamMemberError) throw teamMemberError

        // Insert salary history for new member
        const { error: salaryError } = await supabase
          .from("salary_history")
          .insert({
            team_member_id: newMember.id,
            amount: parseFloat(values.salary.amount),
            start_date: values.salary.start_date,
            end_date: values.salary.end_date,
          })

        if (salaryError) throw salaryError
      }

      toast({
        title: "Success",
        description: `Team member ${id ? "updated" : "added"} successfully`,
      })
      navigate("/team")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {id ? "Edit" : "Add"} Team Member
        </h1>
        <Button variant="outline" onClick={() => navigate("/team")}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TeamMemberBasicFields form={form} />
          <TeamMemberContactFields form={form} />
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate("/team")}>
              Cancel
            </Button>
            <Button type="submit">
              {id ? "Update" : "Add"} Team Member
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
