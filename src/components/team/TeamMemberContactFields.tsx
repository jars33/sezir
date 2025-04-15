
import React from "react"
import type { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
import type { TeamMemberFormSchema } from "./team-member-schema"

interface TeamMemberContactFieldsProps {
  form: UseFormReturn<TeamMemberFormSchema>
  readOnly?: boolean
}

export function TeamMemberContactFields({ form, readOnly = false }: TeamMemberContactFieldsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="company_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('team.companyPhone')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('team.companyPhone')} 
                {...field} 
                value={field.value || ''} 
                disabled={readOnly}
              />
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
            <FormLabel>{t('team.companyEmail')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('team.companyEmail')} 
                type="email"
                {...field} 
                value={field.value || ''} 
                disabled={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
