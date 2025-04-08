# Cleaning Service App - Backend

Node.js backend API for the Cleaning Service Management Application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Port for the API server (default: 5000) |

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build for production
- `npm test` - Run tests

## API Endpoints

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a single customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get a single job
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/:id` - Update a job
- `PUT /api/jobs/:id/status` - Update job status
- `DELETE /api/jobs/:id` - Delete a job
- `POST /api/jobs/generate-recurring` - Generate recurring jobs

### Rounds

- `GET /api/rounds` - Get all rounds
- `GET /api/rounds/:id` - Get a single round
- `POST /api/rounds` - Create a new round
- `PUT /api/rounds/:id` - Update a round
- `DELETE /api/rounds/:id` - Delete a round

## Data Storage

This application uses a simple file-based JSON storage system for development and demonstration purposes. In a production environment, you should replace this with a proper database like MongoDB, PostgreSQL, or MySQL. 