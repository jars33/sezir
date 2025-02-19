import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TeamMembershipDialog } from "@/components/team/TeamMembershipDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const teamFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  manager_id: z.string().optional(),
  parent_team_id: z.string().optional(),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

export default function TeamDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      manager_id: undefined,
      parent_team_id: undefined,
    },
  })

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      if (!id || id === "new") return null
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    },
  })

  const { data: teamMembers, isLoading: isTeamMembersLoading } = useQuery({
    queryKey: ["team-members", id],
    queryFn: async () => {
      if (!id || id === "new") return []
      const { data, error } = await supabase
        .from("team_memberships")
        .select(`
          *,
          team_members (
            id,
            name
          )
        `)
        .eq("team_id", id)

      if (error) throw error
      return data
    },
    enabled: !!id && id !== "new",
  })

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name")

      if (error) throw error
      return data
    },
  })

  async function onSubmit(values: TeamFormValues) {
    try {
      if (team) {
        const { error } = await supabase
          .from("teams")
          .update({
            name: values.name,
            description: values.description || null,
            manager_id: values.manager_id || null,
            parent_team_id: values.parent_team_id || null,
          })
          .eq("id", team.id)

        if (error) throw error
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error("User not authenticated")

        const { error } = await supabase
          .from("teams")
          .insert({
            name: values.name,
            description: values.description || null,
            manager_id: values.manager_id || null,
            parent_team_id: values.parent_team_id || null,
            user_id: user.id,
          })

        if (error) throw error
      }

      navigate("/teams")
      toast({
        title: "Success",
        description: `Team successfully ${team ? "updated" : "created"}`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  if (isTeamLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{id === "new" ? "New" : "Edit"} Team</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/teams")}>
            Back to Teams
          </Button>
          {id !== "new" && (
            <TeamMembershipDialog teamId={id} />
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Manager</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a manager" />
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
              name="parent_team_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Team</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams?.filter(t => t.id !== id).map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {id !== "new" && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers?.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>{membership.team_members.name}</TableCell>
                    <TableCell className="capitalize">{membership.role}</TableCell>
                  </TableRow>
                ))}
                {!isTeamMembersLoading && (!teamMembers || teamMembers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No team members yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={form.handleSubmit(onSubmit)}>
            {id === "new" ? "Create" : "Update"} Team
          </Button>
        </div>
      </div>
    </div>
  )
}
