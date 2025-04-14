
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { AllocationFormValues } from "./allocation-form-schema"

interface AllocationPercentageFieldProps {
  control: Control<AllocationFormValues>
}

export function AllocationPercentageField({ control }: AllocationPercentageFieldProps) {
  const { t } = useTranslation()
  
  return (
    <FormField
      control={control}
      name="allocation"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("allocation.percentage")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              min="0"
              max="100"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
