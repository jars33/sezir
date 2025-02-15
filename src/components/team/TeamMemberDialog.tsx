
import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { TeamMemberBasicFields } from "./TeamMemberBasicFields"
import { TeamMemberContactFields } from "./TeamMemberContactFields"
import { teamMemberFormSchema, type TeamMemberFormSchema } from "./team-member-schema"
import type { TeamMember, TeamMemberFormValues, SalaryHistory } from "@/types/team-member"

interface TeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
  onSuccess: () => void
}

export function TeamMemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: TeamMemberDialogProps) {
  const { session } = useAuth()
  const { toast } = useToast()

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
      user_id: session?.user.id || "",
    },
  })

  useEffect(() => {
    const loadMemberData = async () => {
      if (!open) return // Don't load data if dialog is closed

      if (member) {
        // Fetch the latest salary for this member
        const { data: salaryData, error: salaryError } = await supabase
          .from('salary_history')
          .select('*')
          .eq('team_member_id', member.id)
          .order('start_date', { ascending: false })
          .limit(1)
          .single()

        if (salaryError && salaryError.code !== 'PGRST116') {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load salary history",
          })
          return
        }

        form.reset({
          name: member.name,
          salary: {
            amount: salaryData ? salaryData.amount.toString() : "",
            start_date: salaryData ? salaryData.start_date : format(new Date(), 'yyyy-MM-dd'),
            end_date: salaryData ? salaryData.end_date : null,
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
      } else {
        // Reset form for new team member
        form.reset({
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
          user_id: session?.user.id || "",
        })
      }
    }

    loadMemberData()
  }, [member, form, session, toast, open])

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

      console.log('Submitting team member data:', teamMemberData);
      console.log('Salary data:', values.salary);

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

        console.log('New team member created:', newMember);

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

      onSuccess()
      onOpenChange(false) // Close the dialog after successful submission
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? "Edit" : "Add"} Team Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TeamMemberBasicFields form={form} />
            <TeamMemberContactFields form={form} />
            
            <div className="flex justify-end">
              <Button type="submit">
                {member ? "Update" : "Add"} Team Member
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
