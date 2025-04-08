# Cleaning Service Management Application

A full-stack web application for managing a cleaning service business, including customer management, job scheduling, and route planning.

## Features

- **Customer Management**: Add, edit, and manage customer information with address verification
- **Map Overview**: Visual representation of customers and jobs on an interactive map
- **Work Planner**: Calendar view with drag-and-drop functionality for job scheduling
- **Job Management**: Create, edit, complete, or skip scheduled jobs
- **Recurring Jobs**: Set up recurring job schedules (daily, weekly, biweekly, monthly)
- **Route Planning**: Group customers into rounds for efficient service delivery

## Tech Stack

### Frontend
- React with TypeScript
- Material UI for responsive design
- Mapbox GL for interactive maps
- Date-fns for date manipulation
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript for type safety
- File-based storage (JSON) for simplicity
- RESTful API design

## Getting Started

### Prerequisites
- Node.js (v14.x or higher)
- npm (v6.x or higher)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/cleaning-service-app.git
   cd cleaning-service-app
   ```

2. Install dependencies for backend, frontend, and root project:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   - Create `.env` files in both `/frontend` and `/backend` directories based on the provided `.env.example` files

4. Start the development servers:
   ```bash
   npm run dev
   ```

This will start both frontend and backend servers concurrently.

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

### Adding Customers
1. Navigate to the Customer Management page
2. Click "Add Customer" and enter customer details
3. Use the address search to find and verify customer addresses

### Creating Jobs
1. Go to the Work Planner page
2. Select a date and click "New Job"
3. Fill in the job details, including customer, time, and service type

### Map Overview
1. View all customers and scheduled jobs on the map
2. Filter by job status or date range
3. Click directly on the map to add new customers at specific locations

### Managing Work Schedule
1. Use the calendar view in Work Planner to see daily schedules
2. Complete, skip, or reschedule jobs using the action buttons
3. Generate recurring jobs for regular customers

## Deployment

### Frontend
To build the frontend for production:
```bash
cd frontend
npm run build
```

This creates a `build` folder with optimized production-ready files.

### Backend
To prepare the backend for production:
```bash
cd backend
npm run build
```

## Project Structure

```
cleaning-service-app/
├── backend/               # Backend API server
│   ├── src/               # Source code
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   ├── data/              # Storage for JSON files
│   └── package.json
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
└── package.json           # Root package.json for running both applications
```

## Future Improvements

- Add authentication and user management
- Implement customer login portal
- Add invoicing and payment tracking
- Create mobile app for field workers
- Integrate with third-party calendar applications
- Add analytics dashboard
- Implement real-time notifications

## License

This project is licensed under the MIT License. 