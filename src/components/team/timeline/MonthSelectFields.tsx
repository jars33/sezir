
import { format } from "date-fns"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface MonthSelectFieldsProps {
  control: Control<any>
  isPeriod: boolean
}

export function MonthSelectFields({ control, isPeriod }: MonthSelectFieldsProps) {
  const { t } = useTranslation()

  return (
    <>
      <FormField
        control={control}
        name="startMonth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isPeriod ? t('team.startMonth') : t('common.month')}</FormLabel>
            <FormControl>
              <Input 
                type="month" 
                onChange={(e) => {
                  const date = new Date(e.target.value + "-01")
                  field.onChange(date)
                }}
                value={field.value ? format(field.value, "yyyy-MM") : ""}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isPeriod && (
        <FormField
          control={control}
          name="endMonth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('team.endMonth')}</FormLabel>
              <FormControl>
                <Input 
                  type="month" 
                  onChange={(e) => {
                    const date = new Date(e.target.value + "-01")
                    field.onChange(date)
                  }}
                  value={field.value ? format(field.value, "yyyy-MM") : ""}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
}
