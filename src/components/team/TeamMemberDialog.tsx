
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TeamMemberBasicFields } from "./TeamMemberBasicFields"
import { TeamMemberContactFields } from "./TeamMemberContactFields"
import { teamMemberFormSchema, type TeamMemberFormSchema } from "./team-member-schema"
import type { TeamMember, SalaryHistory } from "@/types/team-member"
import { useTeamMemberSubmit } from "./TeamMemberSubmitHandler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalaryHistorySection } from "./salary/SalaryHistorySection"
import { useTeamMember } from "@/hooks/use-team-member"
import { useTranslation } from "react-i18next"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface TeamMemberDialogProps {
  member?: TeamMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
  readOnly?: boolean
}

export function TeamMemberDialog({
  member,
  open,
  onOpenChange,
  userId,
  onSuccess,
  readOnly = false,
}: TeamMemberDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { handleSubmit: submitHandler } = useTeamMemberSubmit()
  const isNewMember = !member?.id
  const [activeTab, setActiveTab] = useState<string>("basic")
  
  // Fetch salary history if we're editing an existing member
  const { salaryHistory, refetchSalaryHistory } = useTeamMember(member?.id)
  
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
      // Set to basic tab when opening dialog
      setActiveTab("basic")
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
      // When adding new member, salary tab should not be active
      setActiveTab("basic")
    }
  }, [member, userId, form, open])

  const handleFormSubmit = async (values: TeamMemberFormSchema) => {
    try {
      console.log("Submitting form with values:", values)
      const result = await submitHandler(values, isNewMember, member?.id, userId)
      
      let successMessage = isNewMember 
        ? t('team.memberAdded', "Team member successfully added")
        : t('team.memberUpdated', "Team member successfully updated")
        
      if (result?.newUserCreated) {
        successMessage += t('team.userAccountCreated', " and user account created")
      }
      
      toast({
        title: t('common.success'),
        description: successMessage,
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error saving team member:", error)
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message || t('team.saveError', "Failed to save team member"),
      })
    }
  }

  // Use Sheet for mobile view and Dialog for desktop
  const DialogComponent = Dialog
  const DialogContentComponent = DialogContent

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      <DialogContentComponent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isNewMember ? t('team.addTeamMember') : t('team.editTeamMember')}
          </DialogTitle>
          {!isNewMember && (
            <DialogDescription>
              {t('team.editMemberDescription', "Update team member details or manage their salary history")}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {isNewMember ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <TeamMemberBasicFields form={form} />
              <TeamMemberContactFields form={form} />
              <DialogFooter>
                <Button type="submit">
                  {t('team.addTeamMember')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{t('common.details', "Details")}</TabsTrigger>
              <TabsTrigger value="salary" disabled={isNewMember}>{t('salary.history')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                  <TeamMemberBasicFields form={form} />
                  <TeamMemberContactFields form={form} />
                  <DialogFooter>
                    <Button type="submit">
                      {t('team.updateTeamMember', "Update Team Member")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="salary" className="space-y-4 pt-4">
              {member && (
                <SalaryHistorySection 
                  memberId={member.id} 
                  salaryHistory={salaryHistory || []} 
                  refetchSalaryHistory={refetchSalaryHistory}
                  userId={userId}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContentComponent>
    </DialogComponent>
  )
}
