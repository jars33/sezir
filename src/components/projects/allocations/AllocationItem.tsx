
import { AllocationData } from "./types";

interface AllocationItemProps {
  allocation: AllocationData;
  onClick: (allocation: AllocationData) => void;
}

export function AllocationItem({ allocation, onClick }: AllocationItemProps) {
  return (
    <div
      onClick={() => onClick(allocation)}
      className="p-2 min-h-[50px] bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
    >
      <div className="text-sm font-medium text-center">
        {allocation.project_assignments.team_members.name}
      </div>
      <div className="text-xs text-gray-600 text-center">
        {allocation.allocation_percentage}%
      </div>
    </div>
  );
}
