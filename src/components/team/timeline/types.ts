
export interface AllocationData {
  id: string
  month: string
  allocation_percentage: number
  project: {
    id: string
    name: string
    number: string
  }
}
