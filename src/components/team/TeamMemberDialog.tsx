
import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { TeamMember, TeamMemberFormValues } from "@/types/team-member"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  salary: z.string().min(1, "Salary is required"),
  start_date: z.string().min(1, "Start date is required"),
  personal_phone: z.string().nullable(),
  personal_email: z.string().email().nullable(),
  company_phone: z.string().nullable(),
  company_email: z.string().email().nullable(),
  status: z.string().min(1, "Status is required"),
  type: z.enum(["contract", "external"]),
  left_company: z.boolean(),
})

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      salary: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      personal_phone: "",
      personal_email: "",
      company_phone: "",
      company_email: "",
      status: "active",
      type: "contract",
      left_company: false,
    },
  })

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        salary: member.salary.toString(),
        start_date: member.start_date,
        personal_phone: member.personal_phone || "",
        personal_email: member.personal_email || "",
        company_phone: member.company_phone || "",
        company_email: member.company_email || "",
        status: member.status,
        type: member.type,
        left_company: member.left_company,
      })
    } else {
      form.reset({
        name: "",
        salary: "",
        start_date: format(new Date(), 'yyyy-MM-dd'),
        personal_phone: "",
        personal_email: "",
        company_phone: "",
        company_email: "",
        status: "active",
        type: "contract",
        left_company: false,
      })
    }
  }, [member, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user.id) return

    const teamMemberData: TeamMemberFormValues = {
      name: values.name,
      salary: parseFloat(values.salary),
      start_date: values.start_date,
      personal_phone: values.personal_phone || null,
      personal_email: values.personal_email || null,
      company_phone: values.company_phone || null,
      company_email: values.company_email || null,
      status: values.status,
      type: values.type,
      left_company: values.left_company,
      user_id: session.user.id
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personal_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personal_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
