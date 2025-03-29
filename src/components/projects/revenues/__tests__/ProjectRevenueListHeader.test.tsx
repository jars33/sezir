
import { render, screen, fireEvent } from '@/utils/test-utils';
import { ProjectRevenueListHeader } from '../ProjectRevenueListHeader';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('ProjectRevenueListHeader', () => {
  const mockTotalRevenue = 1000;
  const mockOnAddRevenue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the total revenue correctly', () => {
    render(
      <ProjectRevenueListHeader 
        totalRevenue={mockTotalRevenue} 
        onAddRevenue={mockOnAddRevenue} 
      />
    );
    
    expect(screen.getByText('costs.revenues')).toBeInTheDocument();
    expect(screen.getByText('costs.totalRevenue: €1000.00')).toBeInTheDocument();
  });

  it('calls onAddRevenue when the add button is clicked', () => {
    render(
      <ProjectRevenueListHeader 
        totalRevenue={mockTotalRevenue} 
        onAddRevenue={mockOnAddRevenue} 
      />
    );
    
    const addButton = screen.getByText('costs.addRevenue');
    fireEvent.click(addButton);
    
    expect(mockOnAddRevenue).toHaveBeenCalledTimes(1);
  });
});
