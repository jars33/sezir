
# Regression Testing Guide

This project uses Jest and React Testing Library for regression testing.

## Running Tests

To run the tests, execute the following command:

```bash
node src/scripts/run-tests.js
```

Or run Jest directly:

```bash
npx jest
```

For watch mode:

```bash
npx jest --watch
```

## Test Structure

- Unit tests are located next to the components they test in `__tests__` folders
- Test files follow the naming convention `*.test.tsx` or `*.test.ts`
- The `src/utils/test-utils.tsx` file provides a custom render function with all required providers

## Writing Tests

When writing tests, follow these guidelines:

1. Test component rendering and user interactions
2. Use meaningful test descriptions
3. Mock external dependencies
4. Test edge cases and error states
5. Keep tests isolated and independent

Example:

```tsx
import { render, screen } from '@/utils/test-utils';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Coverage Reports

To generate a coverage report:

```bash
npx jest --coverage
```

The report will be available in the `coverage` directory.
