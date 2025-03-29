
import { render, screen, fireEvent } from '@/utils/test-utils';
import { CostActionsDialog } from '../CostActionsDialog';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('CostActionsDialog', () => {
  const mockProps = {
    open: true,
    onOpenChange: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    type: 'variable' as const,
    amount: 1000,
    month: '2023-01-15',
    description: 'Test cost',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with correct cost information', () => {
    render(<CostActionsDialog {...mockProps} />);
    
    expect(screen.getByText('costs.variableCost costs.actions')).toBeInTheDocument();
    expect(screen.getByText('€1000.00')).toBeInTheDocument();
    expect(screen.getByText('Test cost')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<CostActionsDialog {...mockProps} />);
    
    const editButton = screen.getByText('costs.editCost');
    fireEvent.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledTimes(1);
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<CostActionsDialog {...mockProps} />);
    
    const deleteButton = screen.getByText('costs.deleteCost');
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles overhead cost type correctly', () => {
    render(<CostActionsDialog {...mockProps} type="overhead" />);
    
    expect(screen.getByText('costs.overheadCost costs.actions')).toBeInTheDocument();
  });

  it('does not render when amount or month is missing', () => {
    // @ts-ignore - Intentionally passing invalid props to test guard clause
    const { container } = render(<CostActionsDialog {...mockProps} amount={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
