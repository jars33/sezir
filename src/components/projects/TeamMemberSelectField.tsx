
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface TeamMemberSelectFieldProps {
  control: Control<any>
  teamMembers: Array<{ id: string; name: string }>
  disabled?: boolean
}

export function TeamMemberSelectField({ control, teamMembers, disabled }: TeamMemberSelectFieldProps) {
  const { t } = useTranslation()

  return (
    <FormField
      control={control}
      name="teamMemberId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('team.member')}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('team.selectMember')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {teamMembers.length === 0 ? (
                <SelectItem value="no-members" disabled>
                  {t('team.noMembers')}
                </SelectItem>
              ) : (
                teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
