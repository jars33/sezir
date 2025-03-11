import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectVariableCostDialog } from "./ProjectVariableCostDialog"
import { DeleteCostDialog, CostItem } from "./DeleteCostDialog"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface ProjectCostsListProps {
  projectId: string
}

export function ProjectCostsList({ projectId }: ProjectCostsListProps) {
  const [open, setOpen] = useState(false)
  const [costToEdit, setCostToEdit] = useState<CostItem | null>(null)
  const [costToDelete, setCostToDelete] = useState<CostItem | null>(null)
  const queryClient = useQueryClient()

  const { data: costs, isLoading } = useQuery({
    queryKey: ["project-variable-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_variable_costs")
        .select("*")
        .eq("project_id", projectId)
        .order("month")

      if (error) throw error

      return data as CostItem[]
    },
  })

  const handleCostUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["project-variable-costs", projectId] })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Variable Costs</h2>
        <Button onClick={() => setOpen(true)}>Add Variable Cost</Button>
      </div>

      {isLoading ? (
        <p>Loading costs...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costs?.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">{cost.month}</TableCell>
                  <TableCell>{cost.amount}</TableCell>
                  <TableCell>{cost.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setCostToEdit(cost)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCostToDelete(cost)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectVariableCostDialog
        open={open}
        onOpenChange={() => setOpen(false)}
        projectId={projectId}
        onSuccess={handleCostUpdate}
      />

      <ProjectVariableCostDialog
        open={!!costToEdit}
        onOpenChange={() => setCostToEdit(null)}
        projectId={projectId}
        existingCost={costToEdit}
        onSuccess={handleCostUpdate}
      />
      
      <DeleteCostDialog
        open={!!costToDelete}
        onOpenChange={() => setCostToDelete(null)}
        cost={costToDelete}
        type="variable"
        projectId={projectId}
        onSuccess={handleCostUpdate}
      />
    </div>
  );
}
