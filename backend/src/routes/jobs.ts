import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const dataPath = path.join(__dirname, '../../data/jobs.json');
const customersPath = path.join(__dirname, '../../data/customers.json');

// Helper function to read jobs file
const getJobs = (): Job[] => {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write to jobs file
const saveJobs = (jobs: Job[]): void => {
  fs.writeFileSync(dataPath, JSON.stringify(jobs, null, 2));
};

// Helper function to read customers
const getCustomers = (): any[] => {
  if (!fs.existsSync(customersPath)) {
    return [];
  }
  const data = fs.readFileSync(customersPath, 'utf8');
  return JSON.parse(data);
};

// Interface for Job
interface Job {
  id: string;
  customerId: string;
  roundId?: string;
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'skipped';
  recurrence?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  price?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// GET all jobs
router.get('/', (req, res) => {
  try {
    const jobs = getJobs();
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate as string);
      const end = new Date(req.query.endDate as string);
      
      const filteredJobs = jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate >= start && jobDate <= end;
      });
      
      return res.json(filteredJobs);
    }
    
    // Filter by customer if provided
    if (req.query.customerId) {
      const filteredJobs = jobs.filter(job => job.customerId === req.query.customerId);
      return res.json(filteredJobs);
    }
    
    // Filter by round if provided
    if (req.query.roundId) {
      const filteredJobs = jobs.filter(job => job.roundId === req.query.roundId);
      return res.json(filteredJobs);
    }
    
    // Filter by status if provided
    if (req.query.status) {
      const filteredJobs = jobs.filter(job => job.status === req.query.status);
      return res.json(filteredJobs);
    }
    
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ message: 'Failed to get jobs' });
  }
});

// GET single job
router.get('/:id', (req, res) => {
  try {
    const jobs = getJobs();
    const job = jobs.find(j => j.id === req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ message: 'Failed to get job' });
  }
});

// POST new job
router.post('/', (req, res) => {
  try {
    const jobs = getJobs();
    const customers = getCustomers();
    
    // Validate customer exists
    const customerExists = customers.some(c => c.id === req.body.customerId);
    if (!customerExists) {
      return res.status(400).json({ message: 'Customer not found' });
    }
    
    const newJob: Job = {
      id: uuidv4(),
      customerId: req.body.customerId,
      roundId: req.body.roundId,
      title: req.body.title,
      description: req.body.description,
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime,
      duration: req.body.duration || 60, // Default to 1 hour
      status: req.body.status || 'scheduled',
      recurrence: req.body.recurrence || 'none',
      price: req.body.price,
      notes: req.body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    jobs.push(newJob);
    saveJobs(jobs);
    
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

// PUT update job
router.put('/:id', (req, res) => {
  try {
    let jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // If customer ID is being changed, verify it exists
    if (req.body.customerId && req.body.customerId !== jobs[jobIndex].customerId) {
      const customers = getCustomers();
      const customerExists = customers.some(c => c.id === req.body.customerId);
      if (!customerExists) {
        return res.status(400).json({ message: 'Customer not found' });
      }
    }
    
    const updatedJob = {
      ...jobs[jobIndex],
      customerId: req.body.customerId || jobs[jobIndex].customerId,
      roundId: req.body.roundId !== undefined ? req.body.roundId : jobs[jobIndex].roundId,
      title: req.body.title || jobs[jobIndex].title,
      description: req.body.description !== undefined ? req.body.description : jobs[jobIndex].description,
      scheduledDate: req.body.scheduledDate || jobs[jobIndex].scheduledDate,
      scheduledTime: req.body.scheduledTime !== undefined ? req.body.scheduledTime : jobs[jobIndex].scheduledTime,
      duration: req.body.duration || jobs[jobIndex].duration,
      status: req.body.status || jobs[jobIndex].status,
      recurrence: req.body.recurrence !== undefined ? req.body.recurrence : jobs[jobIndex].recurrence,
      price: req.body.price !== undefined ? req.body.price : jobs[jobIndex].price,
      notes: req.body.notes !== undefined ? req.body.notes : jobs[jobIndex].notes,
      updatedAt: new Date().toISOString()
    };
    
    jobs[jobIndex] = updatedJob;
    saveJobs(jobs);
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
});

// PUT update job status
router.put('/:id/status', (req, res) => {
  try {
    let jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (!req.body.status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      status: req.body.status,
      updatedAt: new Date().toISOString()
    };
    
    saveJobs(jobs);
    
    res.json(jobs[jobIndex]);
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ message: 'Failed to update job status' });
  }
});

// DELETE job
router.delete('/:id', (req, res) => {
  try {
    let jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    jobs = jobs.filter(j => j.id !== req.params.id);
    saveJobs(jobs);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

// POST to generate recurring jobs
router.post('/generate-recurring', (req, res) => {
  try {
    if (!req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    const start = new Date(req.body.startDate);
    const end = new Date(req.body.endDate);
    const jobs = getJobs();
    
    // Find jobs with recurrence
    const recurringJobs = jobs.filter(job => 
      job.recurrence && job.recurrence !== 'none' && new Date(job.scheduledDate) < start
    );
    
    const newJobs: Job[] = [];
    
    // Generate recurring jobs between start and end dates
    recurringJobs.forEach(template => {
      const baseDate = new Date(template.scheduledDate);
      let current = new Date(baseDate);
      
      // Move start date up to current if it's in the past
      while (current < start) {
        if (template.recurrence === 'daily') {
          current.setDate(current.getDate() + 1);
        } else if (template.recurrence === 'weekly') {
          current.setDate(current.getDate() + 7);
        } else if (template.recurrence === 'biweekly') {
          current.setDate(current.getDate() + 14);
        } else if (template.recurrence === 'monthly') {
          current.setMonth(current.getMonth() + 1);
        }
      }
      
      // Generate jobs up to end date
      while (current <= end) {
        // Check if a similar job already exists on this date
        const existingJob = jobs.find(j => 
          j.customerId === template.customerId && 
          j.title === template.title && 
          new Date(j.scheduledDate).toDateString() === current.toDateString()
        );
        
        // Only create if no similar job exists
        if (!existingJob) {
          const newJob: Job = {
            id: uuidv4(),
            customerId: template.customerId,
            roundId: template.roundId,
            title: template.title,
            description: template.description,
            scheduledDate: current.toISOString().split('T')[0],
            scheduledTime: template.scheduledTime,
            duration: template.duration,
            status: 'scheduled',
            recurrence: template.recurrence,
            price: template.price,
            notes: template.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          newJobs.push(newJob);
        }
        
        // Advance to next occurrence
        if (template.recurrence === 'daily') {
          current.setDate(current.getDate() + 1);
        } else if (template.recurrence === 'weekly') {
          current.setDate(current.getDate() + 7);
        } else if (template.recurrence === 'biweekly') {
          current.setDate(current.getDate() + 14);
        } else if (template.recurrence === 'monthly') {
          current.setMonth(current.getMonth() + 1);
        }
      }
    });
    
    // Save newly generated jobs
    if (newJobs.length > 0) {
      const allJobs = [...jobs, ...newJobs];
      saveJobs(allJobs);
    }
    
    res.json({ 
      message: `Generated ${newJobs.length} recurring jobs`, 
      jobs: newJobs 
    });
  } catch (error) {
    console.error('Error generating recurring jobs:', error);
    res.status(500).json({ message: 'Failed to generate recurring jobs' });
  }
});

export default router; 