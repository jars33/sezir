
import { format } from "date-fns"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import type { AllocationFormValues } from "./allocation-form-schema"

interface MonthSelectFieldsProps {
  control: Control<AllocationFormValues>
  isPeriod: boolean
}

export function MonthSelectFields({ control, isPeriod }: MonthSelectFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="startMonth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isPeriod ? "Start Month" : "Month"}</FormLabel>
            <FormControl>
              <Input 
                type="month" 
                onChange={(e) => {
                  const date = new Date(e.target.value + "-01")
                  field.onChange(date)
                }}
                value={field.value ? format(field.value, "yyyy-MM") : ""}
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
              <FormLabel>End Month</FormLabel>
              <FormControl>
                <Input 
                  type="month" 
                  onChange={(e) => {
                    const date = new Date(e.target.value + "-01")
                    field.onChange(date)
                  }}
                  value={field.value ? format(field.value, "yyyy-MM") : ""}
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
