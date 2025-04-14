
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface AllocationPercentageFieldProps {
  control: Control<any>
}

export function AllocationPercentageField({ control }: AllocationPercentageFieldProps) {
  const { t } = useTranslation()

  return (
    <FormField
      control={control}
      name="allocation"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('team.allocationPercentage')}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              onChange={(e) => {
                const value = e.target.value;
                const numberValue = parseInt(value);
                
                if (value === "") {
                  field.onChange("");
                  return;
                }

                if (isNaN(numberValue)) {
                  return;
                }

                // Clamp the value between 0 and 100
                const clampedValue = Math.min(Math.max(numberValue, 0), 100);
                field.onChange(clampedValue.toString());
              }}
              value={field.value}
              placeholder={t('team.allocationPlaceholder')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
