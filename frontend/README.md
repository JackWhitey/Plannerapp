# Cleaning Service App - Frontend

The React frontend for the Cleaning Service Management Application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

3. Start the development server:
```bash
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API URL (e.g., http://localhost:5000) |
| `REACT_APP_MAPBOX_ACCESS_TOKEN` | Yes | Mapbox token for maps and geocoding |
| `REACT_APP_LOQATE_API_KEY` | No | Loqate API key for UK address search |
| `REACT_APP_ENABLE_MAPS` | No | Enable/disable maps feature (default: true) |
| `REACT_APP_ENABLE_NOTIFICATIONS` | No | Enable/disable notifications (default: false) |

## Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

## Components

The application is organized into the following major components:

- **Pages**: Main application views
  - Dashboard
  - CustomerManagement
  - MapOverview
  - WorkPlanner

- **Components**: Reusable UI components
  - Navbar
  - CustomerForm
  - JobForm
  - Map

## Features

- Material UI for responsive design
- Interactive maps with Mapbox GL
- Address search and verification
- Calendar-based job scheduling
- Customer management with address verification

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

## Address Search Integration

This application now supports two address search systems:

1. **Mapbox Geocoding API** (default fallback)
2. **Loqate (GBG)** - Higher precision UK address search

### Loqate Integration

The Loqate address search system provides the following benefits:

- **Royal Mail PAF Verification**: Addresses are verified against the official Royal Mail Postcode Address File
- **Comprehensive UK Coverage**: Especially strong for UK addresses with detailed property information
- **Business-specific Data**: Contains information about business premises that's valuable for service scheduling
- **Postcode Intelligence**: Superior handling of UK postcodes with complete address listings within each postcode

### How to Use

#### Configuration

The address search system can be configured in `src/config.ts`:

```typescript
loqate: {
  apiKey: process.env.REACT_APP_LOQATE_API_KEY || 'DEMO_KEY',
  enabled: true // Set to false to use Mapbox instead
}
```

To use Loqate in production:
1. Sign up for a Loqate API key at https://www.loqate.com/
2. Set your API key in the environment as `REACT_APP_LOQATE_API_KEY`

#### Components

The `<LoqateAddressSearch>` component handles all address search functionality and can be used in any form:

```jsx
<LoqateAddressSearch
  onAddressSelect={handleAddressSelect}
  initialValue={initialAddress}
  required={true}
  label="Service Address"
  error={Boolean(addressError)}
/>
```

### Implementation Files

- `src/utils/loqateService.ts` - Core API service
- `src/components/LoqateAddressSearch.tsx` - Reusable component
- `src/config.ts` - Configuration settings

The implementation automatically falls back to Mapbox if Loqate is disabled. 