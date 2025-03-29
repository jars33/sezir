
export interface AllocationData {
  id: string;
  month: string;
  allocation_percentage: number;
  project_assignments: {
    id: string;
    team_members: {
      id: string;
      name: string;
    }
  }
}
