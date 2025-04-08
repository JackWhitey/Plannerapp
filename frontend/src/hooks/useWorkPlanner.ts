import { useState, useEffect, useCallback } from 'react';
import { Job, Customer, Round } from '../types';
import { jobService, customerService, roundService } from '../services/api';
import { useNotifications } from './useNotifications';

export const useWorkPlanner = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotifications();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [jobsData, customersData, roundsData] = await Promise.all([
          jobService.getJobs(),
          customerService.getCustomers(),
          roundService.getRounds()
        ]);
        setJobs(jobsData);
        setCustomers(customersData);
        setRounds(roundsData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        showNotification('Failed to fetch data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  // Job management
  const handleEditJob = useCallback(async (job: Job): Promise<Job> => {
    try {
      const updatedJob = await jobService.updateJob(job);
      setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
      showNotification('Job updated successfully', 'success');
      return updatedJob;
    } catch (err) {
      showNotification('Failed to update job', 'error');
      throw err;
    }
  }, [showNotification]);

  const handleCompleteJob = useCallback(async (jobId: string, notes?: string): Promise<Job> => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');

      // Create a properly typed updated job object
      const updatedJob = await jobService.updateJob({
        ...job,
        status: 'completed',
        completionNotes: notes,
        updatedAt: new Date().toISOString()
      });

      setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
      showNotification('Job completed successfully', 'success');

      // If job is recurring, schedule next occurrence
      if (job.recurring && job.date) {
        const nextDate = new Date(job.date);
        const interval = job.recurring.interval || 0;
        nextDate.setDate(nextDate.getDate() + (interval * 7)); // Convert weeks to days

        // Create a new job with proper typing
        const nextJobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
          customerId: job.customerId,
          roundId: job.roundId,
          title: job.title,
          description: job.description,
          scheduledDate: nextDate.toISOString().split('T')[0],
          scheduledTime: job.scheduledTime,
          duration: job.duration,
          status: 'scheduled',
          price: job.price,
          notes: job.notes,
          // Add the new fields
          date: nextDate.toISOString().split('T')[0],
          time: job.time,
          service: job.service,
          location: job.location,
          recurring: job.recurring
        };

        const nextJob = await jobService.createJob(nextJobData);
        setJobs(prev => [...prev, nextJob]);
      }

      return updatedJob;
    } catch (err) {
      showNotification('Failed to complete job', 'error');
      throw err;
    }
  }, [jobs, showNotification]);

  const handleDeleteJob = useCallback(async (jobId: string): Promise<void> => {
    try {
      await jobService.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      showNotification('Job deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete job', 'error');
      throw err;
    }
  }, [showNotification]);

  const handleGenerateRecurringJobs = useCallback(async (startDate: Date, endDate: Date): Promise<void> => {
    try {
      const newJobs = await jobService.generateRecurringJobs(startDate, endDate);
      setJobs(prev => [...prev, ...newJobs]);
      showNotification('Recurring jobs generated successfully', 'success');
    } catch (err) {
      showNotification('Failed to generate recurring jobs', 'error');
      throw err;
    }
  }, [showNotification]);

  // Customer management
  const handleAddCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    try {
      // Convert to the format expected by the service
      const customerData: Omit<Customer, 'id'> = {
        ...customer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const newCustomer = await customerService.createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      showNotification('Customer added successfully', 'success');
      return newCustomer;
    } catch (err) {
      showNotification('Failed to add customer', 'error');
      throw err;
    }
  }, [showNotification]);

  const handleUpdateCustomer = useCallback(async (customer: Customer): Promise<Customer> => {
    try {
      const updatedCustomer = await customerService.updateCustomer(customer);
      setCustomers(prev => prev.map(c => c.id === customer.id ? updatedCustomer : c));
      showNotification('Customer updated successfully', 'success');
      return updatedCustomer;
    } catch (err) {
      showNotification('Failed to update customer', 'error');
      throw err;
    }
  }, [showNotification]);

  const handleDeleteCustomer = useCallback(async (customerId: string): Promise<void> => {
    try {
      await customerService.deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      
      // Also remove any jobs associated with this customer
      setJobs(prev => prev.filter(job => job.customerId !== customerId));
      
      showNotification('Customer deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete customer', 'error');
      throw err;
    }
  }, [showNotification]);

  // Round management
  const handleAddRound = useCallback(async (round: Omit<Round, 'id'>): Promise<Round> => {
    try {
      const newRound = await roundService.createRound(round);
      setRounds(prev => [...prev, newRound]);
      showNotification('Round added successfully', 'success');
      return newRound;
    } catch (err) {
      showNotification('Failed to add round', 'error');
      throw err;
    }
  }, [showNotification]);

  const handleUpdateRound = useCallback(async (round: Round): Promise<Round> => {
    try {
      const updatedRound = await roundService.updateRound(round);
      setRounds(prev => prev.map(r => r.id === round.id ? updatedRound : r));
      showNotification('Round updated successfully', 'success');
      return updatedRound;
    } catch (err) {
      showNotification('Failed to update round', 'error');
      throw err;
    }
  }, [showNotification]);

  return {
    jobs,
    customers,
    rounds,
    isLoading,
    error,
    handleEditJob,
    handleCompleteJob,
    handleDeleteJob,
    handleUpdateJob: handleEditJob,
    handleGenerateRecurringJobs,
    handleAddCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    handleAddRound,
    handleUpdateRound
  };
}; 