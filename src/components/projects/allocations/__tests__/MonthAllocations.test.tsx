
import { render, screen } from '@/utils/test-utils';
import { MonthAllocations } from '../MonthAllocations';

// Mock the AllocationItem component
jest.mock('../AllocationItem', () => ({
  AllocationItem: ({ allocation, onClick }) => (
    <div 
      data-testid={`allocation-${allocation.id}`}
      onClick={() => onClick(allocation)}
    >
      {allocation.project_assignments.team_members.name} - {allocation.allocation_percentage}%
    </div>
  ),
}));

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key.includes('.') ? key.split('.').pop() : key }),
}));

describe('MonthAllocations', () => {
  const mockMonth = new Date(2023, 0, 1); // January 2023
  const mockAllocations = [
    {
      id: '1',
      month: '2023-01-01',
      allocation_percentage: 75,
      project_assignments: {
        id: 'pa-1',
        team_members: {
          id: 'tm-1',
          name: 'John Doe'
        }
      }
    },
    {
      id: '2',
      month: '2023-01-15',
      allocation_percentage: 50,
      project_assignments: {
        id: 'pa-2',
        team_members: {
          id: 'tm-2',
          name: 'Jane Smith'
        }
      }
    }
  ];

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the month name and year', () => {
    render(
      <MonthAllocations 
        month={mockMonth}
        allocations={mockAllocations}
        onAllocationClick={mockOnClick}
      />
    );
    
    expect(screen.getByText('jan 2023')).toBeInTheDocument();
  });

  it('renders allocations for the given month', () => {
    render(
      <MonthAllocations 
        month={mockMonth}
        allocations={mockAllocations}
        onAllocationClick={mockOnClick}
      />
    );
    
    expect(screen.getByTestId('allocation-1')).toBeInTheDocument();
    expect(screen.getByTestId('allocation-2')).toBeInTheDocument();
  });
});
