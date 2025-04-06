import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { NotificationProvider } from './components/NotificationProvider';
import MapOverview from './pages/MapOverview';
import Dashboard from './pages/Dashboard';
import WorkPlanner from './pages/WorkPlanner';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import { Job } from './types';
import { Box } from '@mui/material';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleEditJob = (job: Job) => {
    setJobs(prevJobs => 
      prevJobs.map(j => j.id === job.id ? job : j)
    );
  };

  const handleCompleteJob = (jobId: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, status: 'completed', lastCompleted: new Date().toISOString() }
          : job
      )
    );
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };

  const handleUpdateJob = (job: Job) => {
    setJobs(prevJobs =>
      prevJobs.map(j => j.id === job.id ? job : j)
    );
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <Router>
            <Navbar />
            <Box sx={{ mt: 2, p: 3 }}>
              <Routes>
                <Route 
                  path="/" 
                  element={<Dashboard jobs={jobs} setJobs={setJobs} />} 
                />
                <Route 
                  path="/map" 
                  element={<MapOverview jobs={jobs} />} 
                />
                <Route 
                  path="/planner" 
                  element={
                    <WorkPlanner 
                      jobs={jobs}
                      onEditJob={handleEditJob}
                      onCompleteJob={handleCompleteJob}
                      onDeleteJob={handleDeleteJob}
                      onUpdateJob={handleUpdateJob}
                    />
                  } 
                />
              </Routes>
            </Box>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
