
import { render, screen } from '@/utils/test-utils';
import { CalendarTeamView } from '../CalendarTeamView';
import { isSameDay } from 'date-fns';

describe('CalendarTeamView', () => {
  const mockDate = new Date(2023, 0, 15);
  
  const mockTeamMembers = [
    {
      id: '1',
      name: 'John Doe',
      type: 'contract' as const,
      start_date: '2023-01-15',
      end_date: null,
      left_company: false
    },
    {
      id: '2',
      name: 'Jane Smith',
      type: 'external' as const,
      start_date: '2023-01-20',
      end_date: null,
      left_company: false
    },
    {
      id: '3',
      name: 'Alice Johnson',
      type: 'contract' as const,
      start_date: '2023-01-15',
      end_date: '2023-03-15',
      left_company: true
    }
  ];

  it('renders team members starting on the given date', () => {
    render(<CalendarTeamView date={mockDate} teamMembers={mockTeamMembers} />);
    
    // Only John Doe and Alice Johnson start on January 15
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('displays a message when no team members start on the given date', () => {
    const differentDate = new Date(2023, 0, 10); // January 10, 2023
    render(<CalendarTeamView date={differentDate} teamMembers={mockTeamMembers} />);
    
    expect(screen.getByText('No team members starting on this date.')).toBeInTheDocument();
  });

  it('shows correct team member type badges', () => {
    render(<CalendarTeamView date={mockDate} teamMembers={mockTeamMembers} />);
    
    const contractBadges = screen.getAllByText('contract');
    expect(contractBadges).toHaveLength(2);
  });

  it('shows "No longer with company" indicator for left members', () => {
    render(<CalendarTeamView date={mockDate} teamMembers={mockTeamMembers} />);
    
    expect(screen.getByText('No longer with company')).toBeInTheDocument();
  });
});
