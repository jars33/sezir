
import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TeamMemberBasicFields } from "@/components/team/TeamMemberBasicFields"
import { TeamMemberContactFields } from "@/components/team/TeamMemberContactFields"
import { teamMemberFormSchema, type TeamMemberFormSchema } from "@/components/team/team-member-schema"
import { SalaryHistory } from "@/components/team/salary/SalaryHistory"
import { useAuth } from "@/components/AuthProvider"
import type { TeamMember, SalaryHistory as SalaryHistoryType } from "@/types/team-member"

export default function TeamMemberDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()

  const { data: member, isLoading: isMemberLoading } = useQuery({
    queryKey: ["team-member", id],
    queryFn: async () => {
      if (!id || id === 'new') return null
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data as TeamMember
    },
  })

  const form = useForm<TeamMemberFormSchema>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: member?.name || "",
      salary: {
        amount: "",
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: null,
      },
      start_date: member?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: member?.end_date || null,
      personal_phone: member?.personal_phone || null,
      personal_email: member?.personal_email || null,
      company_phone: member?.company_phone || null,
      company_email: member?.company_email || null,
      type: member?.type || "contract",
      left_company: member?.left_company || false,
      user_id: session?.user.id || "",
    },
  })

  React.useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        salary: {
          amount: "",  // This will be filled from salary history if needed
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: null,
        },
        start_date: member.start_date,
        end_date: member.end_date,
        personal_phone: member.personal_phone,
        personal_email: member.personal_email,
        company_phone: member.company_phone,
        company_email: member.company_email,
        type: member.type,
        left_company: member.left_company,
        user_id: member.user_id,
      })
    }
  }, [member, form])

  const { data: salaryHistory, isLoading: isSalaryLoading, refetch: refetchSalaryHistory } = useQuery({
    queryKey: ["team-member-salary-history", id],
    queryFn: async () => {
      if (!id || id === 'new') return []
      const { data, error } = await supabase
        .from("salary_history")
        .select("*")
        .eq("team_member_id", id)
        .order("start_date", { ascending: false })

      if (error) throw error
      return data as SalaryHistoryType[]
    },
  })

  const handleAddSalary = async (values: { amount: string, start_date: string, end_date: string }) => {
    if (!id || id === 'new' || !session?.user.id) return;

    try {
      const { error } = await supabase
        .from("salary_history")
        .insert({
          team_member_id: id,
          amount: parseFloat(values.amount),
          start_date: values.start_date,
          end_date: values.end_date,
        })

      if (error) throw error

      await refetchSalaryHistory()

      toast({
        title: "Success",
        description: "Salary history updated successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  if (isMemberLoading || isSalaryLoading) {
    return <div className="p-8">Loading...</div>
  }

  async function onSubmit(values: TeamMemberFormSchema) {
    if (!session?.user.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to perform this action",
      })
      return
    }

    try {
      const teamMemberData = {
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

      if (member) {
        // Update existing team member
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .update(teamMemberData)
          .eq("id", member.id)

        if (teamMemberError) throw teamMemberError

        // Update or insert salary history
        const { error: salaryError } = await supabase
          .from("salary_history")
          .insert({
            team_member_id: member.id,
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

      navigate("/team")
      toast({
        title: "Success",
        description: `Team member successfully ${member ? "updated" : "added"}`,
      })
    } catch (error: any) {
      console.error("Error in onSubmit:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{id === 'new' ? 'Add' : 'Edit'} Team Member</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/team")}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TeamMemberBasicFields form={form} />
            <TeamMemberContactFields form={form} />
          </form>
        </Form>

        {id !== 'new' && (
          <SalaryHistory 
            id={id} 
            salaryHistory={salaryHistory} 
            handleAddSalary={handleAddSalary} 
          />
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={form.handleSubmit(onSubmit)}>
            {id === 'new' ? "Add" : "Update"} Team Member
          </Button>
        </div>
      </div>
    </div>
  )
}
