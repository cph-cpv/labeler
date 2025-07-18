# Labeler

A web application for managing virus samples and file annotations with PocketBase backend.

## Development

1. Install packages:

   ```bash
   npm install
   ```

2. Start Pocketbase (development):

   ```bash
   docker compose up -d
   ```

3. Start the frontend server:
   ```bash
   npm run dev
   ```

The app will be available at http://localhost:3000 with PocketBase at http://localhost:8080.

## Testing

Run end-to-end tests with Playwright:

```bash
npx playwright test
```

Tests run in complete isolation:

- **Test frontend**: http://localhost:3001
- **Test PocketBase**: http://localhost:8081 (separate Docker container)
- **Clean state**: Fresh database and test user created for each test run

## Port Allocation

| Environment | Frontend | PocketBase | Purpose           |
| ----------- | -------- | ---------- | ----------------- |
| Development | 3000     | 8080       | Human development |
| Testing     | 3001     | 8081       | Automated tests   |
