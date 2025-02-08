
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UseFormReturn } from "react-hook-form"
import type { ProjectFormSchema } from "./project-schema"

interface ProjectBasicFieldsProps {
  form: UseFormReturn<ProjectFormSchema>
}

export function ProjectBasicFields({ form }: ProjectBasicFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Number</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value?.toISOString().split('T')[0] || ''} />
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
            <FormLabel>End Date (optional)</FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field} 
                value={field.value?.toISOString().split('T')[0] || ''} 
                onChange={(e) => {
                  const value = e.target.value ? new Date(e.target.value) : null;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
