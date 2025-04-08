import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Temporary in-memory storage
const customers: any[] = [];
const jobs: any[] = [];
const rounds: any[] = [];

// Routes
app.get('/', (req, res) => {
  res.send('Cleaning Service API is running');
});

// Customer routes
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const customer = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  customers.push(customer);
  res.status(201).json(customer);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
});

app.put('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  customers[index] = {
    ...customers[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(customers[index]);
});

app.delete('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  customers.splice(index, 1);
  res.status(204).send();
});

// Job routes
app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

app.post('/api/jobs', (req, res) => {
  const job = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  jobs.push(job);
  res.status(201).json(job);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  res.json(job);
});

app.put('/api/jobs/:id', (req, res) => {
  const index = jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  jobs[index] = {
    ...jobs[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(jobs[index]);
});

app.delete('/api/jobs/:id', (req, res) => {
  const index = jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  jobs.splice(index, 1);
  res.status(204).send();
});

// Round routes
app.get('/api/rounds', (req, res) => {
  res.json(rounds);
});

app.post('/api/rounds', (req, res) => {
  const round = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  rounds.push(round);
  res.status(201).json(round);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
}); 