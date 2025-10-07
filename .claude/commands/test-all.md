---
description: Run all tests across the project
---

Run the complete test suite for both API and frontend.

Please execute the following:

**API Tests** (if available):
```bash
cd api
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

**Frontend Tests** (if available):
```bash
cd app
npm run test          # Run tests
npm run test:coverage # Coverage report
```

**Note**: If test scripts are not configured yet, I can help set them up:
- Jest for API unit/integration tests
- Vitest for frontend component tests
- Playwright or Cypress for E2E tests

Would you like me to check which test frameworks are configured?
