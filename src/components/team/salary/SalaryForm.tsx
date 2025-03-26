
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { SalaryHistory } from "@/types/team-member"

const salaryFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().nullable(),
})

type SalaryFormValues = z.infer<typeof salaryFormSchema>

interface SalaryFormProps {
  salary: SalaryHistory | null
  onSubmit: (values: SalaryFormValues) => Promise<void>
  onCancel: () => void
}

export function SalaryForm({ salary, onSubmit, onCancel }: SalaryFormProps) {
  const isEditing = !!salary
  
  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      amount: salary ? salary.amount.toString() : "",
      start_date: salary ? salary.start_date : new Date().toISOString().split('T')[0],
      end_date: salary?.end_date || null,
    },
  })

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""} 
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update" : "Add"} Salary
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
