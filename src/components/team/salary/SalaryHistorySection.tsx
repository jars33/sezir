
import React, { useState } from "react"
import { format, subDays, parseISO } from "date-fns"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAddSalary } from "./AddSalaryHandler"
import { SalaryForm } from "./SalaryForm"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { SalaryHistory } from "@/types/team-member"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

interface SalaryHistorySectionProps {
  memberId: string
  salaryHistory: SalaryHistory[]
  refetchSalaryHistory: (options?: RefetchOptions) => Promise<QueryObserverResult<SalaryHistory[], Error>>
  userId: string
}

export function SalaryHistorySection({ 
  memberId, 
  salaryHistory, 
  refetchSalaryHistory,
  userId 
}: SalaryHistorySectionProps) {
  const { t } = useTranslation();
  const [showSalaryForm, setShowSalaryForm] = useState(false)
  const [editingSalary, setEditingSalary] = useState<SalaryHistory | null>(null)
  const [salaryToDelete, setSalaryToDelete] = useState<string | null>(null)
  
  const { handleAddSalary, handleEditSalary, handleDeleteSalary, updatePreviousSalaryEndDate } = useAddSalary(refetchSalaryHistory)

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return format(new Date(date), "MMM d, yyyy")
  }

  const handleSalarySubmit = async (values: { amount: string, start_date: string, end_date: string }) => {
    try {
      if (editingSalary) {
        await handleEditSalary(editingSalary.id, values)
      } else {
        // Find the most recent active salary (with no end date or end date after the new start date)
        const activeSalaries = salaryHistory.filter(
          (salary) => !salary.end_date || new Date(salary.end_date) >= new Date(values.start_date)
        ).sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        
        const mostRecentSalary = activeSalaries[0];
        
        // If there is an active salary, update its end date before adding the new one
        if (mostRecentSalary) {
          const dayBeforeNewStart = format(subDays(parseISO(values.start_date), 1), 'yyyy-MM-dd');
          await updatePreviousSalaryEndDate(mostRecentSalary.id, dayBeforeNewStart);
        }
        
        // Now add the new salary
        await handleAddSalary(memberId, values, false, userId)
      }
      setShowSalaryForm(false)
      setEditingSalary(null)
    } catch (error) {
      console.error("Error handling salary submission:", error);
    }
  }

  const handleDeleteConfirm = async () => {
    if (salaryToDelete) {
      await handleDeleteSalary(salaryToDelete)
      setSalaryToDelete(null)
    }
  }

  const startEditSalary = (salary: SalaryHistory) => {
    setEditingSalary(salary)
    setShowSalaryForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('salary.history')}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setEditingSalary(null)
            setShowSalaryForm(true)
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('salary.addSalary')}
        </Button>
      </div>

      {showSalaryForm && (
        <SalaryForm
          salary={editingSalary}
          onSubmit={handleSalarySubmit}
          onCancel={() => {
            setShowSalaryForm(false)
            setEditingSalary(null)
          }}
        />
      )}

      {salaryHistory.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('salary.startDate')}</TableHead>
              <TableHead>{t('salary.endDate')}</TableHead>
              <TableHead className="text-right">{t('salary.amount')}</TableHead>
              <TableHead className="w-[100px]">{t('project.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryHistory.map((salary) => (
              <TableRow key={salary.id}>
                <TableCell>{formatDate(salary.start_date)}</TableCell>
                <TableCell>{formatDate(salary.end_date)}</TableCell>
                <TableCell className="text-right">{formatSalary(salary.amount)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => startEditSalary(salary)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSalaryToDelete(salary.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
          <p className="text-muted-foreground">{t('salary.noHistory')}</p>
        </div>
      )}

      <AlertDialog open={!!salaryToDelete} onOpenChange={(open) => !open && setSalaryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('salary.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('salary.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('dialog.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
