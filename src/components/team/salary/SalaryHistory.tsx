
import { format } from "date-fns"
import { PlusCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { SalaryHistory } from "@/types/team-member"

interface SalaryHistoryProps {
  id: string
  salaryHistory: SalaryHistory[] | undefined
  handleAddSalary: (values: { amount: string, start_date: string, end_date: string }) => Promise<void>
}

export function SalaryHistory({ id, salaryHistory, handleAddSalary }: SalaryHistoryProps) {
  const salaryForm = useForm({
    defaultValues: {
      amount: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: "",
    },
  })

  const handleShowAddSalary = (e: React.MouseEvent) => {
    e.preventDefault();
    const salarySection = document.getElementById('add-salary-section');
    if (salarySection) {
      salarySection.style.display = 'block';
    }
  }

  const onSubmit = async (values: { amount: string, start_date: string, end_date: string }) => {
    await handleAddSalary(values);
    salaryForm.reset();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Salary History</h2>
        <Button 
          type="button"
          variant="ghost" 
          size="icon"
          onClick={handleShowAddSalary}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      
      <div id="add-salary-section" style={{ display: 'none' }} className="mb-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={salaryForm.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={salaryForm.control}
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
              control={salaryForm.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="button" onClick={salaryForm.handleSubmit(onSubmit)}>Add Salary</Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Start Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">End Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {salaryHistory?.map((salary) => (
              <tr key={salary.id}>
                <td className="px-4 py-3 text-sm">{salary.amount}</td>
                <td className="px-4 py-3 text-sm">{salary.start_date}</td>
                <td className="px-4 py-3 text-sm">{salary.end_date || '-'}</td>
              </tr>
            ))}
            {!salaryHistory?.length && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm text-center text-gray-500">
                  No salary history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
