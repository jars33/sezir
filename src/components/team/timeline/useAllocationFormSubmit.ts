
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { allocationFormSchema, type AllocationFormValues } from "./allocation-form-schema"
import { useTranslation } from "react-i18next"

interface UseAllocationFormSubmitProps {
  onSubmit: (values: { projectId: string; month: Date; allocation: string }) => Promise<void>
  open: boolean
}

export function useAllocationFormSubmit({ onSubmit, open }: UseAllocationFormSubmitProps) {
  const { t } = useTranslation()
  
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      allocation: "100",
      startMonth: new Date(),
    },
  })

  const handleSubmit = async (values: AllocationFormValues) => {
    const startDate = new Date(values.startMonth)
    const endDate = values.endMonth ? new Date(values.endMonth) : startDate

    if (values.endMonth && endDate < startDate) {
      form.setError("endMonth", {
        type: "manual",
        message: t('team.endMonthError'),
      })
      return
    }

    // Set dates to first of month for accurate month calculations
    startDate.setDate(1)
    endDate.setDate(1)
    
    const months: Date[] = []
    let currentDate = new Date(startDate)
    
    // Include all months up to and including the end month
    while (currentDate <= endDate) {
      months.push(new Date(currentDate))
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Submit allocations for each month in the period
    for (const month of months) {
      await onSubmit({
        projectId: values.projectId,
        month,
        allocation: values.allocation,
      })
    }
  }

  return { form, handleSubmit }
}
