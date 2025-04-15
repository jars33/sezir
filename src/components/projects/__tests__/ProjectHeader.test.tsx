
import { render, screen, fireEvent } from '@/utils/test-utils';
import { ProjectHeader } from '../ProjectHeader';

// Mock react-router-dom's navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => ({
    data: [
      { id: 'team-1', name: 'Test Team 1' },
      { id: 'team-2', name: 'Test Team 2' }
    ],
    isLoading: false
  }),
}));

describe('ProjectHeader', () => {
  const mockProps = {
    projectNumber: 'P-2023-001',
    projectName: 'Test Project',
    projectStatus: 'in_progress' as const,
    projectId: 'proj-123',
    teamId: null,
    hasPermission: true,
    onEditClick: jest.fn(),
    onDeleteClick: jest.fn(),
    onTeamChange: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project name and number correctly', () => {
    render(<ProjectHeader {...mockProps} />);
    
    expect(screen.getByText('P-2023-001 - Test Project')).toBeInTheDocument();
  });

  it('shows project status', () => {
    render(<ProjectHeader {...mockProps} />);
    
    expect(screen.getByText('Status: in progress')).toBeInTheDocument();
  });

  it('shows edit and delete buttons when user has permission', () => {
    render(<ProjectHeader {...mockProps} />);
    
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByText('Delete Project')).toBeInTheDocument();
  });

  it('hides edit and delete buttons when user has no permission', () => {
    render(<ProjectHeader {...mockProps} hasPermission={false} />);
    
    expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
    expect(screen.getByText("You don't have permission to edit this project")).toBeInTheDocument();
  });

  it('calls navigate(-1) when back button is clicked', () => {
    render(<ProjectHeader {...mockProps} />);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls onEditClick when edit button is clicked', () => {
    render(<ProjectHeader {...mockProps} />);
    
    const editButton = screen.getByText('Edit Project');
    fireEvent.click(editButton);
    
    expect(mockProps.onEditClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteClick when delete button is clicked', () => {
    render(<ProjectHeader {...mockProps} />);
    
    const deleteButton = screen.getByText('Delete Project');
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDeleteClick).toHaveBeenCalledTimes(1);
  });
});
