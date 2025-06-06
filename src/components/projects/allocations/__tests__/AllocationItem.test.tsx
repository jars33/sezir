
import { render, screen, fireEvent } from '@/utils/test-utils';
import { AllocationItem } from '../AllocationItem';

const mockAllocation = {
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
};

const mockOnClick = jest.fn();

describe('AllocationItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders team member name and allocation percentage correctly', () => {
    render(<AllocationItem allocation={mockAllocation} onClick={mockOnClick} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<AllocationItem allocation={mockAllocation} onClick={mockOnClick} />);
    
    // Using fireEvent instead of directly calling click()
    const item = screen.getByRole('button');
    fireEvent.click(item);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockAllocation);
  });
});
