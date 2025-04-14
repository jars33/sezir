
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import { useTranslation } from "react-i18next"
import type { Team, TeamMember } from "@/types"

const teamFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  manager_id: z.string().optional(),
  parent_team_id: z.string().optional(),
})

export type TeamFormValues = z.infer<typeof teamFormSchema>

interface TeamFormProps {
  team: Team | null
  id: string | undefined
}

export function TeamForm({ team, id }: TeamFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      manager_id: team?.manager_id || undefined,
      parent_team_id: team?.parent_team_id || undefined,
    },
  })

  React.useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || "",
        manager_id: team.manager_id || undefined,
        parent_team_id: team.parent_team_id || undefined,
      })
    }
  }, [team, form])

  const { data: availableManagers } = useQuery({
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

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name")

      if (error) throw error
      return data || []
    },
  })

  async function onSubmit(values: TeamFormValues) {
    try {
      const { error } = team 
        ? await supabase
            .from("teams")
            .update({
              name: values.name,
              description: values.description || null,
              manager_id: values.manager_id || null,
              parent_team_id: values.parent_team_id || null,
            })
            .eq("id", team.id)
        : await supabase
            .from("teams")
            .insert({
              name: values.name,
              description: values.description || null,
              manager_id: values.manager_id || null,
              parent_team_id: values.parent_team_id || null,
            })

      if (error) throw error

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      if (team?.id) {
        queryClient.invalidateQueries({ queryKey: ["team", team.id] })
      }

      navigate("/teams")
      toast({
        title: t('common.success'),
        description: team ? t('team.teamUpdated') : t('team.teamCreated'),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('team.teamName')}</FormLabel>
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
              <FormLabel>{t('team.description')}</FormLabel>
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
              <FormLabel>{t('team.teamManager')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('team.selectManager')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableManagers?.map((member) => (
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
              <FormLabel>{t('team.parentTeam')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('team.selectParentTeam')} />
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
        
        <div className="pt-4">
          <Button type="submit">
            {id === "new" ? t('team.createTeam') : t('team.updateTeam')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
