
import { useQuery } from "@tanstack/react-query"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UseFormReturn } from "react-hook-form"
import type { ProjectFormSchema } from "./project-schema"
import { useTranslation } from "react-i18next"
import { teamsService } from "@/services/supabase"

interface TeamSelectFieldProps {
  form: UseFormReturn<ProjectFormSchema>
}

export function TeamSelectField({ form }: TeamSelectFieldProps) {
  const { t } = useTranslation()

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      return await teamsService.getTeams();
    },
  })

  return (
    <FormField
      control={form.control}
      name="team_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('project.team')}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || "no-team"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('project.selectTeam')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  {t('common.loading')}
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="no-team">
                    {t('project.noTeam')}
                  </SelectItem>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
