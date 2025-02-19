
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

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("left_company", false)
        .order("name")

      if (error) throw error
      return data
    },
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
          .update(values)
          .eq("id", team.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("teams")
          .insert([values])

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
        <Button variant="outline" onClick={() => navigate("/teams")}>
          Back to Teams
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
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

            <div className="flex justify-end">
              <Button type="submit">
                {id === "new" ? "Create" : "Update"} Team
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
