
import { render, screen } from '@/utils/test-utils';
import { AllocationsGrid } from '../AllocationsGrid';

// Mock the MonthAllocations component
jest.mock('../MonthAllocations', () => ({
  MonthAllocations: ({ month }: { month: Date }) => (
    <div data-testid={`month-${month.getMonth()}`}>
      Month: {month.getMonth() + 1}
    </div>
  ),
}));

describe('AllocationsGrid', () => {
  const mockMonths = [
    new Date(2023, 0, 1), // January
    new Date(2023, 1, 1), // February
  ];
  
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
    }
  ];
  
  const mockOnClick = jest.fn();

  it('renders a grid with the correct number of months', () => {
    render(
      <AllocationsGrid 
        months={mockMonths}
        allocations={mockAllocations}
        onAllocationClick={mockOnClick}
      />
    );

    expect(screen.getByTestId('month-0')).toBeInTheDocument();
    expect(screen.getByTestId('month-1')).toBeInTheDocument();
    expect(screen.queryByTestId('month-2')).not.toBeInTheDocument();
  });
});
