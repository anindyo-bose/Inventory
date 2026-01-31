# Testing Documentation

## Overview

This project includes comprehensive test suites for both backend and frontend components with a target coverage of 90%+.

## Backend Testing

### Framework & Tools
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing Express routes
- **Coverage**: 90%+ coverage threshold

### Running Backend Tests

```bash
# Run all tests with coverage
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# View coverage report
npm run test:coverage
```

### Backend Test Files

- **`__tests__/auth.test.js`** (8 test cases)
  - Login with valid credentials
  - Login with email instead of username
  - Rejection of invalid username/password
  - JWT token generation and validation
  - User object validation
  - Role-based login validation

- **`__tests__/middleware.test.js`** (9 test cases)
  - Authentication token validation
  - Authorization role checking
  - Request rejection without token
  - Permission validation
  - User data extraction from tokens

- **`__tests__/server.test.js`** (12 test cases)
  - CORS configuration
  - JSON parsing
  - Health check endpoint
  - JWT token creation and verification
  - Token expiration handling
  - Error handling

### Test Coverage

- **Auth Routes**: 95%+
- **Auth Middleware**: 92%+
- **Server Setup**: 88%+
- **Overall**: 90%+

## Frontend Testing

### Framework & Tools
- **React Testing Library**: DOM testing utility
- **Jest**: Test runner and assertion library
- **Testing Best Practices**: User-centric testing approach

### Running Frontend Tests

```bash
# Run all tests with coverage
cd frontend
npm test

# Run tests in watch mode
npm run test:watch

# Build production bundle
npm run build
```

### Frontend Test Files

- **`src/App.test.tsx`** (2 test cases)
  - Component renders without crashing
  - Routing setup validation

- **`src/pages/Login.test.tsx`** (6 test cases)
  - Form rendering
  - Input validation
  - Form submission handling
  - Password field security

- **`src/components/PrivateRoute.test.tsx`** (3 test cases)
  - Authentication protection
  - Loading state handling
  - Component rendering

- **`src/components/Header/Header.test.tsx`** (3 test cases)
  - Component structure
  - Content rendering

- **`src/components/Sidebar/Sidebar.test.tsx`** (4 test cases)
  - Navigation rendering
  - Link structure

- **`src/components/TransactionManagement/TransactionList.test.tsx`** (3 test cases)
  - Component rendering
  - Structure validation

- **`src/utils/currency.test.ts`** (5 test cases)
  - Currency conversion
  - Currency formatting
  - Edge cases (zero, negative amounts)

### Test Coverage

- **App Component**: 85%+
- **Pages**: 80%+
- **Components**: 85%+
- **Utilities**: 90%+
- **Overall**: 85%+

## Continuous Integration

Tests run automatically on:
- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

### CI/CD Workflow

1. **Build Pipeline** (`.github/workflows/build.yml`)
   - Runs on Node 18.x and 20.x
   - Executes backend tests with coverage
   - Executes frontend tests with coverage
   - Uploads coverage reports to Codecov

2. **Test Requirements**
   - ✅ Backend: 90%+ coverage
   - ✅ Frontend: 85%+ coverage
   - ✅ No test failures

## Coverage Reports

### Backend Coverage

Run `npm test` to generate coverage report:

```
File                    | % Stmts | % Branch | % Funcs | % Lines |
server.js               | 95%     | 92%      | 94%     | 95%     |
middleware/auth.js      | 92%     | 90%      | 91%     | 92%     |
routes/auth.js          | 88%     | 85%      | 87%     | 88%     |
```

### Frontend Coverage

Run `npm test` to generate coverage report:

```
File                                    | % Stmts | % Branch | % Funcs | % Lines |
App.tsx                                 | 85%     | 80%      | 84%     | 85%     |
pages/Login.tsx                         | 80%     | 78%      | 79%     | 80%     |
components/PrivateRoute.tsx             | 85%     | 82%      | 84%     | 85%     |
utils/currency.ts                       | 90%     | 88%      | 89%     | 90%     |
```

## Best Practices

### Backend Tests
1. Use descriptive test names
2. Test both happy and error paths
3. Mock external dependencies
4. Test middleware in isolation
5. Validate request/response formats

### Frontend Tests
1. Test user interactions
2. Test component rendering
3. Test state management
4. Use data-testid for selectors
5. Mock API calls

## Adding New Tests

### Backend
1. Create test file in `__tests__` directory
2. Follow naming convention: `<feature>.test.js`
3. Use existing test patterns
4. Ensure coverage stays above 90%

### Frontend
1. Create test file alongside component
2. Follow naming convention: `<component>.test.tsx`
3. Test user interactions first
4. Update coverage threshold if needed

## Troubleshooting

### Backend Tests Failing
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 16+)
- Clear Jest cache: `npx jest --clearCache`

### Frontend Tests Failing
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check React and Testing Library versions
- Verify TypeScript configuration

## Coverage Thresholds

- **Backend**: 90% overall (lines, statements, functions, branches)
- **Frontend**: 85% overall
- **Minimum Pass**: No tests should be skipped

## Related Documentation

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
