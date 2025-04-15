
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import type { TeamMemberFormSchema } from "./team-member-schema"

interface TeamMemberBasicFieldsProps {
  form: UseFormReturn<TeamMemberFormSchema>
  readOnly?: boolean
}

export function TeamMemberBasicFields({ form, readOnly = false }: TeamMemberBasicFieldsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('common.name')}</FormLabel>
            <FormControl>
              <Input placeholder={t('common.name')} {...field} disabled={readOnly} />
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
            <FormLabel>{t('team.type')}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={readOnly}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('team.selectType')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="contract">{t('team.contract')}</SelectItem>
                <SelectItem value="external">{t('team.external')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('salary.startDate')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('salary.endDateOptional')}</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
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
    </div>
  )
}
