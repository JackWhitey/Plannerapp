# Cleaning Service App Frontend

A React-based frontend for a cleaning service management application.

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation
```bash
npm install
```

### Development
```bash
npm start
```
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Testing
```bash
npm test
```
Launches the test runner in interactive watch mode.

### Building for Production
```bash
npm run build
```
Builds the app for production to the `build` folder.

## Development Guidelines

### Code Style
- Use TypeScript for all new components
- Follow the Airbnb React/JSX Style Guide
- Use functional components with hooks
- Implement proper error boundaries
- Use proper TypeScript types and interfaces

### Component Structure
- Keep components small and focused
- Use proper folder structure:
  ```
  src/
    components/     # Reusable UI components
    pages/         # Page components
    hooks/         # Custom hooks
    utils/         # Utility functions
    types/         # TypeScript type definitions
    services/      # API services
    context/       # React context providers
    assets/        # Static assets
  ```

### State Management
- Use React Context for global state
- Use local state for component-specific state
- Implement proper loading and error states

### API Integration
- Use axios for HTTP requests
- Implement proper error handling
- Use environment variables for API endpoints

### Testing
- Write unit tests for components
- Write integration tests for critical flows
- Use React Testing Library

### Performance
- Implement proper code splitting
- Use React.memo for expensive components
- Optimize images and assets
- Use proper caching strategies

### Security
- Never commit sensitive data
- Use environment variables for secrets
- Implement proper authentication
- Sanitize user inputs

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_API_URL=your_api_url_here
```

## Git Workflow
1. Create feature branches from `main`
2. Follow conventional commits
3. Create PRs for code review
4. Squash and merge to `main`

## Troubleshooting
- Clear browser cache if changes aren't reflecting
- Check console for errors
- Verify environment variables
- Check network requests in dev tools 