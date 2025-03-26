
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TeamMemberBasicFields } from "./TeamMemberBasicFields"
import { TeamMemberContactFields } from "./TeamMemberContactFields"
import { teamMemberFormSchema, type TeamMemberFormSchema } from "./team-member-schema"
import type { TeamMember } from "@/types/team-member"
import { useTeamMemberSubmit } from "./TeamMemberSubmitHandler"

interface TeamMemberDialogProps {
  member?: TeamMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

export function TeamMemberDialog({
  member,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: TeamMemberDialogProps) {
  const { toast } = useToast()
  const { handleSubmit: submitHandler } = useTeamMemberSubmit()
  const isNewMember = !member?.id
  
  const form = useForm<TeamMemberFormSchema>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      company_phone: null,
      company_email: null,
      type: "contract",
      left_company: false,
      user_id: userId,
    },
  })

  // Reset form with member data when editing
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name || "",
        start_date: member.start_date || new Date().toISOString().split('T')[0],
        end_date: member.end_date,
        company_phone: member.company_phone,
        company_email: member.company_email,
        type: member.type || "contract",
        left_company: member.left_company || false,
        user_id: userId,
      })
    } else {
      form.reset({
        name: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        company_phone: null,
        company_email: null,
        type: "contract",
        left_company: false,
        user_id: userId,
      })
    }
  }, [member, userId, form])

  const handleFormSubmit = async (values: TeamMemberFormSchema) => {
    try {
      console.log("Submitting form with values:", values)
      const result = await submitHandler(values, isNewMember, member?.id, userId)
      
      let successMessage = isNewMember 
        ? "Team member successfully added" 
        : "Team member successfully updated"
        
      if (result?.newUserCreated) {
        successMessage += " and user account created"
      }
      
      toast({
        title: "Success",
        description: successMessage,
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error saving team member:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save team member",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isNewMember ? "Add Team Member" : "Edit Team Member"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <TeamMemberBasicFields form={form} />
            <TeamMemberContactFields form={form} />
            <DialogFooter>
              <Button type="submit">
                {isNewMember ? "Add" : "Update"} Team Member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
