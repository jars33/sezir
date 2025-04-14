
import * as z from "zod"
import { useTranslation } from "react-i18next"

export type AllocationFormValues = z.infer<typeof createAllocationFormSchema>

export function useAllocationFormSchema() {
  const { t } = useTranslation()
  
  return z.object({
    projectId: z.string().min(1, t('project.selectProject')),
    startMonth: z.date(),
    endMonth: z.date().optional(),
    allocation: z.string().refine(
      (val) => {
        const num = parseInt(val)
        return !isNaN(num) && num >= 0 && num <= 100
      },
      {
        message: t('team.allocationValidation'),
      }
    ),
  })
}

// Create a fallback schema for when the hook can't be used
export const allocationFormSchema = z.object({
  projectId: z.string().min(1, "Please select a project"),
  startMonth: z.date(),
  endMonth: z.date().optional(),
  allocation: z.string().refine(
    (val) => {
      const num = parseInt(val)
      return !isNaN(num) && num >= 0 && num <= 100
    },
    {
      message: "Allocation must be a number between 0 and 100",
    }
  ),
})

export function createAllocationFormSchema() {
  const { t } = useTranslation()
  
  return z.object({
    projectId: z.string().min(1, t('project.selectProject')),
    startMonth: z.date(),
    endMonth: z.date().optional(),
    allocation: z.string().refine(
      (val) => {
        const num = parseInt(val)
        return !isNaN(num) && num >= 0 && num <= 100
      },
      {
        message: t('team.allocationValidation'),
      }
    ),
  })
}
