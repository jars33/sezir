
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control } from "react-hook-form"
import type { AllocationFormValues } from "./allocation-form-schema"
import type { Project } from "./useProjectsData"

interface ProjectSelectFieldProps {
  control: Control<AllocationFormValues>
  projects?: Project[]
}

export function ProjectSelectField({ control, projects }: ProjectSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="projectId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.number} - {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
