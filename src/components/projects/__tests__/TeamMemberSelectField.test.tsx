
import { render, screen, fireEvent } from '@/utils/test-utils';
import { TeamMemberSelectField } from '../TeamMemberSelectField';
import { useForm } from 'react-hook-form';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// Create a test wrapper component to use the form hook
const TestWrapper = ({ 
  teamMembers, 
  defaultValue = '', 
  disabled = false 
}) => {
  const { control } = useForm({ 
    defaultValues: { teamMemberId: defaultValue } 
  });
  
  return (
    <TeamMemberSelectField 
      control={control}
      teamMembers={teamMembers}
      disabled={disabled}
    />
  );
};

describe('TeamMemberSelectField', () => {
  const mockTeamMembers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' }
  ];

  it('renders label correctly', () => {
    render(<TestWrapper teamMembers={mockTeamMembers} />);
    
    expect(screen.getByText('team.member')).toBeInTheDocument();
  });

  it('shows placeholder when no value is selected', () => {
    render(<TestWrapper teamMembers={mockTeamMembers} />);
    
    expect(screen.getByText('team.selectMember')).toBeInTheDocument();
  });

  it('displays "No members" when team members list is empty', async () => {
    render(<TestWrapper teamMembers={[]} />);
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // The "no members" text should be in the dropdown
    expect(await screen.findByText('team.noMembers')).toBeInTheDocument();
  });

  it('is disabled when the disabled prop is true', () => {
    render(<TestWrapper teamMembers={mockTeamMembers} disabled={true} />);
    
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
