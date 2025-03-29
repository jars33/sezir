
import { render, screen, fireEvent } from '@/utils/test-utils';
import { ProjectStatusFilter } from '../ProjectStatusFilter';

describe('ProjectStatusFilter', () => {
  const mockSelectedStatuses: string[] = [];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the filter button correctly', () => {
    render(
      <ProjectStatusFilter 
        selectedStatuses={mockSelectedStatuses} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows the count of selected statuses', () => {
    render(
      <ProjectStatusFilter 
        selectedStatuses={['planned', 'in_progress']} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('toggles status selection when clicked', async () => {
    render(
      <ProjectStatusFilter 
        selectedStatuses={mockSelectedStatuses} 
        onChange={mockOnChange} 
      />
    );
    
    // Open the popover
    fireEvent.click(screen.getByText('Status'));
    
    // Click on one of the status options
    const plannedOption = await screen.findByText('Planned');
    fireEvent.click(plannedOption);
    
    expect(mockOnChange).toHaveBeenCalledWith(['planned']);
  });

  it('removes status when already selected', async () => {
    render(
      <ProjectStatusFilter 
        selectedStatuses={['planned']} 
        onChange={mockOnChange} 
      />
    );
    
    // Open the popover
    fireEvent.click(screen.getByText('Status'));
    
    // Click on the already selected status
    const plannedOption = await screen.findByText('Planned');
    fireEvent.click(plannedOption);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('clears all filters when Clear button is clicked', async () => {
    render(
      <ProjectStatusFilter 
        selectedStatuses={['planned', 'in_progress']} 
        onChange={mockOnChange} 
      />
    );
    
    // Open the popover
    fireEvent.click(screen.getByText('Status'));
    
    // Click the Clear button
    const clearButton = await screen.findByText('Clear');
    fireEvent.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
