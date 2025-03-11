
import { format } from "date-fns"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { SalaryHistory } from "@/types/team-member"

interface SalaryHistoryProps {
  id: string
  salaryHistory: SalaryHistory[] | undefined
  handleAddSalary: (values: { amount: string, start_date: string, end_date: string }) => Promise<void>
  handleEditSalary?: (id: string, values: { amount: string, start_date: string, end_date: string }) => Promise<void>
  handleDeleteSalary?: (id: string) => Promise<void>
}

export function SalaryHistory({ 
  id, 
  salaryHistory, 
  handleAddSalary, 
  handleEditSalary, 
  handleDeleteSalary 
}: SalaryHistoryProps) {
  const form = useForm({
    defaultValues: {
      amount: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: "",
    },
  })

  const [editingId, setEditingId] = React.useState<string | null>(null);

  const handleShowAddSalary = (e: React.MouseEvent) => {
    e.preventDefault();
    resetForm();
    const salarySection = document.getElementById('add-salary-section');
    if (salarySection) {
      salarySection.style.display = 'block';
    }
  }

  const handleShowEditSalary = (salary: SalaryHistory) => {
    setEditingId(salary.id);
    form.reset({
      amount: salary.amount.toString(),
      start_date: salary.start_date,
      end_date: salary.end_date || "",
    });
    const salarySection = document.getElementById('add-salary-section');
    if (salarySection) {
      salarySection.style.display = 'block';
    }
  }

  const resetForm = () => {
    setEditingId(null);
    form.reset({
      amount: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: "",
    });
  }

  const onSubmit = async (values: { amount: string, start_date: string, end_date: string }) => {
    console.log('Submitting salary with values:', values);
    if (editingId && handleEditSalary) {
      await handleEditSalary(editingId, values);
    } else {
      await handleAddSalary(values);
    }
    
    // Reset form and hide form section
    resetForm();
    const salarySection = document.getElementById('add-salary-section');
    if (salarySection) {
      salarySection.style.display = 'none';
    }
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
      
      <div id="add-salary-section" style={{ display: 'none' }} className="mb-8 border rounded-lg p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  const salarySection = document.getElementById('add-salary-section');
                  if (salarySection) {
                    salarySection.style.display = 'none';
                  }
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Update' : 'Add'} Salary</Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Start Date</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">End Date</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {salaryHistory?.map((salary) => (
              <tr key={salary.id}>
                <td className="px-4 py-3 text-sm text-center">€{salary.amount}</td>
                <td className="px-4 py-3 text-sm text-center">{salary.start_date}</td>
                <td className="px-4 py-3 text-sm text-center">{salary.end_date || '-'}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex justify-center gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleShowEditSalary(salary)}
                      title="Edit salary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteSalary && handleDeleteSalary(salary.id)}
                      title="Delete salary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!salaryHistory?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-500">
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
