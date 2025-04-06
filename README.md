# Cleaning Service Application

A full-stack application for managing cleaning service jobs, built with React, TypeScript, and Node.js.

## Project Structure

```
cleaning-service-app/
├── frontend/           # React frontend application
│   ├── src/           # Source files
│   │   ├── components/# React components
│   │   ├── pages/     # Page components
│   │   ├── types/     # TypeScript type definitions
│   │   └── utils/     # Utility functions
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
│
├── backend/           # Node.js backend application
│   ├── src/          # Source files
│   ├── routes/       # API routes
│   └── package.json  # Backend dependencies
│
└── README.md         # This file
```

## Setup

### Frontend
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Mapbox token:
```
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server:
```bash
npm start
```

### Backend
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```
PORT=3001
MONGODB_URI=your_mongodb_uri
```

4. Start the server:
```bash
npm start
```

## Features

- Interactive map view of job locations
- Job scheduling and management
- Customer information tracking
- Real-time updates
- Responsive design

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Mapbox GL JS
  - React Map GL

- Backend:
  - Node.js
  - Express
  - MongoDB
  - TypeScript 