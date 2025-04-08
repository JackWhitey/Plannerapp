import axios from 'axios';
import { Job, Customer, Round } from '../types';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh', { refreshToken });
        const { token } = response.data;
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Sample data for testing when backend is not available
const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '07700 900123',
    address: '123 Main St, Worthing, UK',
    notes: 'Key under mat',
    latitude: 50.8225,
    longitude: -0.3714,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '07700 900456',
    address: '456 High St, Brighton, UK',
    notes: 'Ring doorbell twice',
    latitude: 50.8229,
    longitude: -0.1363,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleRounds: Round[] = [
  {
    id: '1',
    name: 'Worthing Round',
    description: 'Regular customers in Worthing area',
    color: '#4CAF50',
    dayOfWeek: 1, // Monday
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Brighton Round',
    description: 'Regular customers in Brighton area',
    color: '#2196F3',
    dayOfWeek: 3, // Wednesday
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleJobs: Job[] = [
  {
    id: '1',
    customerId: '1',
    roundId: '1',
    title: 'Window Cleaning - John Smith',
    description: 'Clean all exterior windows',
    scheduledDate: formatDate(new Date()),
    scheduledTime: '09:00',
    duration: 60,
    status: 'scheduled',
    recurrence: 'biweekly',
    price: 30,
    notes: 'Bring extension ladder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    customerId: '2',
    roundId: '2',
    title: 'Window Cleaning - Jane Doe',
    description: 'Clean all exterior and interior windows',
    scheduledDate: formatDate(new Date()),
    scheduledTime: '11:00',
    duration: 90,
    status: 'scheduled',
    recurrence: 'monthly',
    price: 45,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const jobService = {
  getJobs: async (): Promise<Job[]> => {
    try {
      const response = await api.get('/api/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return sampleJobs; // Fallback to sample data
    }
  },

  getJobsInDateRange: async (startDate: Date, endDate: Date): Promise<Job[]> => {
    try {
      const response = await api.get('/api/jobs', {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs in date range:', error);
      return sampleJobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate >= startDate && jobDate <= endDate;
      });
    }
  },

  getJob: async (id: string): Promise<Job> => {
    try {
      const response = await api.get(`/api/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      const job = sampleJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      return job;
    }
  },

  createJob: async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
    try {
      const response = await api.post('/api/jobs', job);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      const newJob: Job = {
        ...job,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sampleJobs.push(newJob);
      return newJob;
    }
  },

  updateJob: async (job: Job): Promise<Job> => {
    try {
      const response = await api.put(`/api/jobs/${job.id}`, job);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      const index = sampleJobs.findIndex(j => j.id === job.id);
      if (index === -1) throw new Error('Job not found');
      sampleJobs[index] = { ...job, updatedAt: new Date().toISOString() };
      return sampleJobs[index];
    }
  },

  updateJobStatus: async (id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'skipped'): Promise<Job> => {
    try {
      const response = await api.put(`/api/jobs/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      const index = sampleJobs.findIndex(j => j.id === id);
      if (index === -1) throw new Error('Job not found');
      sampleJobs[index] = { 
        ...sampleJobs[index], 
        status, 
        updatedAt: new Date().toISOString() 
      };
      return sampleJobs[index];
    }
  },

  deleteJob: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/jobs/${id}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      const index = sampleJobs.findIndex(j => j.id === id);
      if (index === -1) throw new Error('Job not found');
      sampleJobs.splice(index, 1);
    }
  },

  generateRecurringJobs: async (startDate: Date, endDate: Date): Promise<Job[]> => {
    try {
      const response = await api.post('/api/jobs/generate-recurring', { 
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });
      return response.data.jobs;
    } catch (error) {
      console.error('Error generating recurring jobs:', error);
      // Simple recurring job generation for testing
      const newJobs: Job[] = [];
      sampleJobs.forEach(job => {
        if (job.recurrence && job.recurrence !== 'none') {
          let current = new Date(job.scheduledDate);
          while (current <= endDate) {
            if (job.recurrence === 'daily') {
              current.setDate(current.getDate() + 1);
            } else if (job.recurrence === 'weekly') {
              current.setDate(current.getDate() + 7);
            } else if (job.recurrence === 'biweekly') {
              current.setDate(current.getDate() + 14);
            } else if (job.recurrence === 'monthly') {
              current.setMonth(current.getMonth() + 1);
            }
            
            if (current >= startDate && current <= endDate) {
              const newJob: Job = {
                ...job,
                id: Math.random().toString(36).substring(2, 11),
                scheduledDate: formatDate(current),
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              newJobs.push(newJob);
            }
          }
        }
      });
      return newJobs;
    }
  }
};

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await api.get('/api/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return sampleCustomers;
    }
  },

  getCustomer: async (id: string): Promise<Customer> => {
    try {
      const response = await api.get(`/api/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      const customer = sampleCustomers.find(c => c.id === id);
      if (!customer) throw new Error('Customer not found');
      return customer;
    }
  },

  createCustomer: async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    try {
      const response = await api.post('/api/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      const newCustomer: Customer = {
        ...customer,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sampleCustomers.push(newCustomer);
      return newCustomer;
    }
  },

  updateCustomer: async (customer: Customer): Promise<Customer> => {
    try {
      const response = await api.put(`/api/customers/${customer.id}`, customer);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      const index = sampleCustomers.findIndex(c => c.id === customer.id);
      if (index === -1) throw new Error('Customer not found');
      sampleCustomers[index] = { 
        ...customer, 
        updatedAt: new Date().toISOString() 
      };
      return sampleCustomers[index];
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/customers/${id}`);
    } catch (error) {
      console.error('Error deleting customer:', error);
      const index = sampleCustomers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Customer not found');
      sampleCustomers.splice(index, 1);
    }
  }
};

export const roundService = {
  getRounds: async (): Promise<Round[]> => {
    try {
      const response = await api.get('/api/rounds');
      return response.data;
    } catch (error) {
      console.error('Error fetching rounds:', error);
      return sampleRounds;
    }
  },

  getRound: async (id: string): Promise<Round> => {
    try {
      const response = await api.get(`/api/rounds/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching round:', error);
      const round = sampleRounds.find(r => r.id === id);
      if (!round) throw new Error('Round not found');
      return round;
    }
  },

  createRound: async (round: Omit<Round, 'id' | 'createdAt' | 'updatedAt'>): Promise<Round> => {
    try {
      const response = await api.post('/api/rounds', round);
      return response.data;
    } catch (error) {
      console.error('Error creating round:', error);
      const newRound: Round = {
        ...round,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sampleRounds.push(newRound);
      return newRound;
    }
  },

  updateRound: async (round: Round): Promise<Round> => {
    try {
      const response = await api.put(`/api/rounds/${round.id}`, round);
      return response.data;
    } catch (error) {
      console.error('Error updating round:', error);
      const index = sampleRounds.findIndex(r => r.id === round.id);
      if (index === -1) throw new Error('Round not found');
      sampleRounds[index] = { 
        ...round, 
        updatedAt: new Date().toISOString() 
      };
      return sampleRounds[index];
    }
  },

  deleteRound: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/rounds/${id}`);
    } catch (error) {
      console.error('Error deleting round:', error);
      const index = sampleRounds.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Round not found');
      sampleRounds.splice(index, 1);
    }
  }
};

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

export default api; 