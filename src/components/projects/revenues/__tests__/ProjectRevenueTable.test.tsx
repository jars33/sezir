
import { render, screen, fireEvent } from '@/utils/test-utils';
import { ProjectRevenueTable } from '../ProjectRevenueTable';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// Mock the useLocalStorage hook
jest.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: () => [true],
}));

describe('ProjectRevenueTable', () => {
  const mockRevenues = [
    {
      id: '1',
      month: '2023-01-15',
      amount: 1000,
      project_id: 'p1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    },
    {
      id: '2',
      month: '2023-02-15',
      amount: 2000,
      project_id: 'p1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }
  ];
  
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table headers correctly', () => {
    render(
      <ProjectRevenueTable 
        revenues={mockRevenues} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByText('common.month')).toBeInTheDocument();
    expect(screen.getByText('common.amount')).toBeInTheDocument();
    expect(screen.getByText('project.actions')).toBeInTheDocument();
  });

  it('renders revenue items correctly', () => {
    render(
      <ProjectRevenueTable 
        revenues={mockRevenues} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    // We check for the formatted amounts since the implementation adds the € symbol
    expect(screen.getByText('€1000.00')).toBeInTheDocument();
    expect(screen.getByText('€2000.00')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ProjectRevenueTable 
        revenues={mockRevenues} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    const editButtons = screen.getAllByTitle('common.edit');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockRevenues[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ProjectRevenueTable 
        revenues={mockRevenues} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    const deleteButtons = screen.getAllByTitle('common.delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockRevenues[0]);
  });
});
