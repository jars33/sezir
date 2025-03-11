
import React from "react"
import { format } from "date-fns"
import { ProjectRevenueDialog } from "../../revenues/ProjectRevenueDialog"
import { DeleteCostDialog } from "../../costs/DeleteCostDialog"
import type { TimelineItem } from "./types"

interface RevenueActionsProps {
  addRevenueDate: Date | null
  selectedRevenue: TimelineItem | null
  deleteRevenue: TimelineItem | null
  setAddRevenueDate: (date: Date | null) => void
  setSelectedRevenue: (revenue: TimelineItem | null) => void
  setDeleteRevenue: (revenue: TimelineItem | null) => void
}

export function RevenueActions({
  addRevenueDate,
  selectedRevenue,
  deleteRevenue,
  setAddRevenueDate,
  setSelectedRevenue,
  setDeleteRevenue,
}: RevenueActionsProps) {
  return (
    <>
      {/* Revenue Dialog */}
      <ProjectRevenueDialog
        open={addRevenueDate !== null}
        onOpenChange={() => setAddRevenueDate(null)}
        onSubmit={({ month, amount }) => {
          // Handle submission of revenue
          setAddRevenueDate(null)
        }}
        defaultValues={{
          month: addRevenueDate ? format(addRevenueDate, 'yyyy-MM') : '',
          amount: ''
        }}
      />

      {/* Revenue Edit Dialog */}
      {selectedRevenue && (
        <ProjectRevenueDialog
          open={selectedRevenue !== null}
          onOpenChange={() => setSelectedRevenue(null)}
          onSubmit={({ month, amount }) => {
            // Handle update of revenue
            setSelectedRevenue(null)
          }}
          defaultValues={{
            month: selectedRevenue ? selectedRevenue.month : '',
            amount: selectedRevenue ? selectedRevenue.amount.toString() : '',
          }}
          showDelete={true}
          onDelete={() => {
            setDeleteRevenue(selectedRevenue)
            setSelectedRevenue(null)
          }}
        />
      )}

      {/* Delete Revenue Dialog */}
      {deleteRevenue && (
        <DeleteCostDialog
          open={deleteRevenue !== null}
          onOpenChange={() => setDeleteRevenue(null)}
          onConfirm={() => setDeleteRevenue(null)}
          type="revenue"
        />
      )}
    </>
  )
}
