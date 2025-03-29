
import { render, screen, fireEvent } from '@/utils/test-utils';
import { DeleteProjectDialog } from '../DeleteProjectDialog';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('DeleteProjectDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with warning message when open', () => {
    render(
      <DeleteProjectDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    expect(screen.getByText('dialog.areYouSure')).toBeInTheDocument();
    expect(screen.getByText('dialog.deleteProjectWarning')).toBeInTheDocument();
  });

  it('does not render the dialog when not open', () => {
    render(
      <DeleteProjectDialog 
        open={false} 
        onOpenChange={mockOnOpenChange} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    expect(screen.queryByText('dialog.areYouSure')).not.toBeInTheDocument();
  });

  it('calls onConfirm when delete button is clicked', () => {
    render(
      <DeleteProjectDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    const deleteButton = screen.getByText('dialog.delete');
    fireEvent.click(deleteButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange when cancel button is clicked', () => {
    render(
      <DeleteProjectDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    const cancelButton = screen.getByText('dialog.cancel');
    fireEvent.click(cancelButton);
    
    // The AlertDialogCancel component typically calls onOpenChange(false)
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
