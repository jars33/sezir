
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormReturn } from "react-hook-form"
import type { TeamMemberFormSchema } from "./team-member-schema"

interface TeamMemberBasicFieldsProps {
  form: UseFormReturn<TeamMemberFormSchema>
}

export function TeamMemberBasicFields({ form }: TeamMemberBasicFieldsProps) {
  return (
    <>
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

      <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium">Salary Information</h3>
        
        <FormField
          control={form.control}
          name="salary.amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary.start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary.end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary End Date (optional)</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => {
                    const value = e.target.value || null;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
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
                value={field.value || ''} 
                onChange={(e) => {
                  const value = e.target.value || null;
                  field.onChange(value);
                }}
              />
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
            <FormLabel>Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
