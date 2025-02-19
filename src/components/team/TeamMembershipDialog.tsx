
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { TeamMember } from "@/types/team-member"

const teamMembershipFormSchema = z.object({
  team_member_id: z.string().min(1, "Team member is required"),
  role: z.string().min(1, "Role is required"),
})

type TeamMembershipFormValues = z.infer<typeof teamMembershipFormSchema>

interface TeamMembershipDialogProps {
  teamId: string
  trigger?: React.ReactNode
}

export function TeamMembershipDialog({ teamId, trigger }: TeamMembershipDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<TeamMembershipFormValues>({
    resolver: zodResolver(teamMembershipFormSchema),
    defaultValues: {
      team_member_id: "",
      role: "member",
    },
  })

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members-available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("left_company", false)
        .order("name")

      if (error) throw error
      return data as TeamMember[]
    },
  })

  async function onSubmit(values: TeamMembershipFormValues) {
    try {
      const { error } = await supabase
        .from("team_memberships")
        .insert({
          team_id: teamId,
          team_member_id: values.team_member_id,
          role: values.role,
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Team member added successfully",
      })

      // Invalidate team members query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] })
      
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Team Member</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="team_member_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Add Member</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
