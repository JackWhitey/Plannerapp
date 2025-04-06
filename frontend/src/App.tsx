import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import WorkPlanner from './pages/WorkPlanner';
import Services from './pages/Services';
import Login from './pages/Login';
import MapOverview from './pages/MapOverview';

interface Job {
  id: string;
  customer: string;
  address: string;
  service: string;
  price: number;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'skipped';
  notes: string;
  round: string;
  frequency: number;
  lastCompleted: string | null;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      customer: 'John Smith',
      address: '123 Main St, London',
      service: 'Window Cleaning',
      price: 50,
      date: '2024-03-20',
      time: '09:00',
      status: 'scheduled' as const,
      notes: 'Front windows only',
      round: 'Round 1',
      frequency: 1,
      lastCompleted: null,
    },
    {
      id: '2',
      customer: 'Jane Doe',
      address: '456 Park Ave, London',
      service: 'Gutter Cleaning',
      price: 75,
      date: '2024-03-20',
      time: '11:00',
      status: 'completed' as const,
      notes: 'Back gutters only',
      round: 'Round 2',
      frequency: 1,
      lastCompleted: '2024-03-20',
    },
    {
      id: '3',
      customer: 'Bob Wilson',
      address: '789 High St, London',
      service: 'Pressure Washing',
      price: 100,
      date: '2024-03-21',
      time: '14:00',
      status: 'skipped' as const,
      notes: 'Rescheduled for next week',
      round: 'Round 3',
      frequency: 1,
      lastCompleted: null,
    }
  ]);

  const handleEditJob = (job: any) => {
    // Implement job editing logic
    console.log('Editing job:', job);
  };

  const handleCompleteJob = (jobId: string) => {
    // Implement job completion logic
    console.log('Completing job:', jobId);
  };

  const handleDeleteJob = (jobId: string) => {
    // Implement job deletion logic
    console.log('Deleting job:', jobId);
  };

  const handleUpdateJob = (job: any) => {
    // Implement job update logic
    console.log('Updating job:', job);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard jobs={jobs} setJobs={setJobs} />} />
              <Route 
                path="/work-planner" 
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
              <Route path="/services" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route path="/map-overview" element={<MapOverview jobs={jobs} />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
