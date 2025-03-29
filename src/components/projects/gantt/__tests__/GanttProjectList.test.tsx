
import { render, screen, fireEvent } from '@/utils/test-utils';
import { GanttProjectList } from '../GanttProjectList';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => {
    // Handle the specific cases used in the component
    if (key === 'project.planned') return 'Planned';
    if (key === 'project.inProgress') return 'In Progress';
    if (key === 'project.completed') return 'Completed';
    if (key === 'project.cancelled') return 'Cancelled';
    if (key === 'common.projects') return 'Projects';
    if (key === 'common.noProjectsFound') return 'No projects found';
    return key;
  }}),
}));

describe('GanttProjectList', () => {
  const mockProjects = [
    {
      id: '1',
      number: 'P001',
      name: 'Project 1',
      status: 'planned' as const,
      start_date: '2023-01-01',
      end_date: '2023-03-31',
    },
    {
      id: '2',
      number: 'P002',
      name: 'Project 2',
      status: 'in_progress' as const,
      start_date: '2023-02-01',
      end_date: null,
    },
    {
      id: '3',
      number: 'P003',
      name: 'Project 3',
      status: 'completed' as const,
      start_date: '2023-01-15',
      end_date: '2023-02-15',
    },
  ];
  
  const mockOnProjectClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders projects correctly', () => {
    render(
      <GanttProjectList 
        projects={mockProjects} 
        onProjectClick={mockOnProjectClick} 
      />
    );
    
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('P001 - Project 1')).toBeInTheDocument();
    expect(screen.getByText('P002 - Project 2')).toBeInTheDocument();
    expect(screen.getByText('P003 - Project 3')).toBeInTheDocument();
  });

  it('renders status badges correctly', () => {
    render(
      <GanttProjectList 
        projects={mockProjects} 
        onProjectClick={mockOnProjectClick} 
      />
    );
    
    expect(screen.getByText('Planned')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onProjectClick with the correct project when clicked', () => {
    render(
      <GanttProjectList 
        projects={mockProjects} 
        onProjectClick={mockOnProjectClick} 
      />
    );
    
    const project1 = screen.getByText('P001 - Project 1');
    fireEvent.click(project1);
    
    expect(mockOnProjectClick).toHaveBeenCalledTimes(1);
    expect(mockOnProjectClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('displays a message when no projects are available', () => {
    render(
      <GanttProjectList 
        projects={[]} 
        onProjectClick={mockOnProjectClick} 
      />
    );
    
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });
});
