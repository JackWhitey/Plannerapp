import { useState, useCallback } from 'react';
import { Job } from '../types';
import { jobService } from '../services/api';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedJobs = await jobService.getJobs();
      setJobs(fetchedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateJob = useCallback(async (job: Job) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedJob = await jobService.updateJob(job);
      setJobs(prevJobs => prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j));
      return updatedJob;
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteJob = useCallback(async (jobId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await jobService.deleteJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCompleteJob = useCallback(async (jobId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Find the job in our current state
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Update its status to 'completed'
      const completedJob = { ...job, status: 'completed' as const };
      const updatedJob = await jobService.updateJob(completedJob);
      
      setJobs(prevJobs => prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j));
      return updatedJob;
    } catch (err) {
      console.error('Error completing job:', err);
      setError('Failed to complete job. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [jobs]);

  return {
    jobs,
    isLoading,
    error,
    fetchJobs,
    handleUpdateJob,
    handleDeleteJob,
    handleCompleteJob,
  };
}; 