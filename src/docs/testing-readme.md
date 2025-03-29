
# Testing Guide

This project uses Jest and React Testing Library for testing components and functionality.

## Running Tests

Tests can be run using the following command:

```bash
node src/scripts/run-tests.js
```

This will execute all tests in the project.

## Test Structure

Tests are organized in `__tests__` directories next to the components they test. This keeps tests close to the code they're testing and makes it easier to maintain.

### Example
```
src/components/projects/allocations/
├── AllocationItem.tsx
├── AllocationsGrid.tsx
├── MonthAllocations.tsx
├── __tests__/
│   ├── AllocationItem.test.tsx
│   ├── AllocationsGrid.test.tsx
│   └── MonthAllocations.test.tsx
```

## Writing Tests

### Basic Component Test

For a simple component, test that it renders correctly and its interactions work as expected:

```jsx
import { render, screen, fireEvent } from '@/utils/test-utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Mocking Dependencies

When a component has dependencies like hooks or other components, you may need to mock them:

```jsx
// Mock a hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '123', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

// Mock a component
jest.mock('../ChildComponent', () => ({
  ChildComponent: () => <div data-testid="mocked-child">Mocked Child</div>,
}));
```

### Testing Forms

For components with forms, you can test form submissions:

```jsx
it('submits form with correct values', async () => {
  const handleSubmit = jest.fn();
  render(<FormComponent onSubmit={handleSubmit} />);
  
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Name' } });
  fireEvent.click(screen.getByText('Submit'));
  
  expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Test Name',
  }));
});
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how it does it
2. **Use user-centric queries** - Prefer methods like `getByRole`, `getByLabelText`, and `getByText` over `getByTestId`
3. **Keep tests focused** - Each test should verify one specific aspect of behavior
4. **Use the `data-testid` attribute sparingly** - Only use it when there's no better way to select an element
5. **Clear mocks between tests** - Use `beforeEach(() => { jest.clearAllMocks(); })` to reset mocks

## Regression Testing Strategy

When adding new features or fixing bugs:

1. Write tests that verify the current behavior before making changes
2. Implement your changes
3. Ensure all tests still pass
4. Add new tests for the new functionality or the fixed bug

This ensures that changes don't break existing functionality.
