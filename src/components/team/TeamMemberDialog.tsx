
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
import { teamMemberFormSchema } from "./team-member-schema"
import type { TeamMember, TeamMemberFormValues } from "@/types/team-member"

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

  const form = useForm({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      salary: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: null,
      personal_phone: "",
      personal_email: "",
      company_phone: "",
      company_email: "",
      type: "contract",
      left_company: false,
      user_id: "",
    },
  })

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        salary: member.salary.toString(),
        start_date: member.start_date,
        end_date: member.end_date,
        personal_phone: member.personal_phone || "",
        personal_email: member.personal_email || "",
        company_phone: member.company_phone || "",
        company_email: member.company_email || "",
        type: member.type,
        left_company: member.left_company,
        user_id: member.user_id,
      })
    } else if (session?.user.id) {
      form.reset({
        name: "",
        salary: "",
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: null,
        personal_phone: "",
        personal_email: "",
        company_phone: "",
        company_email: "",
        type: "contract",
        left_company: false,
        user_id: session.user.id,
      })
    }
  }, [member, form, session])

  async function onSubmit(values: typeof teamMemberFormSchema._type) {
    if (!session?.user.id) return

    const teamMemberData: TeamMemberFormValues = {
      name: values.name,
      salary: parseFloat(values.salary),
      start_date: values.start_date,
      end_date: values.end_date,
      personal_phone: values.personal_phone || null,
      personal_email: values.personal_email || null,
      company_phone: values.company_phone || null,
      company_email: values.company_email || null,
      type: values.type,
      left_company: values.left_company,
      user_id: session.user.id,
    }

    try {
      if (member) {
        const { error } = await supabase
          .from("team_members")
          .update(teamMemberData)
          .eq("id", member.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("team_members")
          .insert(teamMemberData)

        if (error) throw error
      }

      onSuccess()
    } catch (error: any) {
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
