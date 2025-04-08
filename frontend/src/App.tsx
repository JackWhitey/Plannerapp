import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import { ThemeProvider, Box, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MapOverview from './pages/MapOverview';
import WorkPlanner from './pages/WorkPlanner';
import CustomerManagement from './pages/CustomerManagement';
import { NotificationProvider } from './context/NotificationContext';
import { useWorkPlanner } from './hooks/useWorkPlanner';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRound, setSelectedRound] = useState<string>('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <NotificationProvider>
          <ErrorBoundary name="App">
            <Router>
              <Navbar />
              <Box sx={{ 
                flexGrow: 1, 
                pt: 10, // Increased padding to account for fixed navbar
                px: { xs: 2, sm: 3, md: 4 }, // Add responsive horizontal padding
                pb: 4, // Add bottom padding
                minHeight: 'calc(100vh - 64px)', // Set minimum height to fill the viewport
                backgroundColor: 'background.default',
              }}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ErrorBoundary name="Dashboard">
                        <DashboardWrapper />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/map"
                    element={
                      <ErrorBoundary name="MapOverview">
                        <MapWrapper
                          selectedDate={selectedDate}
                          selectedRound={selectedRound}
                          onSelectRound={setSelectedRound}
                        />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/planner"
                    element={
                      <ErrorBoundary name="WorkPlanner">
                        <PlannerWrapper
                          selectedDate={selectedDate}
                          onDateChange={setSelectedDate}
                        />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/customers"
                    element={
                      <ErrorBoundary name="CustomerManagement">
                        <CustomerWrapper />
                      </ErrorBoundary>
                    }
                  />
                </Routes>
              </Box>
            </Router>
          </ErrorBoundary>
        </NotificationProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

// Wrapper components to use hooks within the route components
const DashboardWrapper: React.FC = () => {
  const {
    jobs,
    customers,
    rounds,
    isLoading,
    error,
    handleEditJob,
    handleCompleteJob,
    handleDeleteJob,
    handleUpdateJob,
    handleAddCustomer,
    handleUpdateCustomer
  } = useWorkPlanner();

  return (
    <Dashboard
      jobs={jobs}
      customers={customers}
      rounds={rounds}
      onEditJob={handleEditJob}
      onCompleteJob={handleCompleteJob}
      onDeleteJob={handleDeleteJob}
      onUpdateJob={handleUpdateJob}
      onAddCustomer={handleAddCustomer}
      onUpdateCustomer={handleUpdateCustomer}
      isLoading={isLoading}
      error={error}
    />
  );
};

const MapWrapper: React.FC<{
  selectedDate: Date;
  selectedRound: string;
  onSelectRound: (roundId: string) => void;
}> = ({ selectedDate, selectedRound, onSelectRound }) => {
  const {
    jobs,
    customers,
    rounds,
    isLoading,
    error,
    handleEditJob,
    handleCompleteJob,
    handleDeleteJob,
    handleUpdateJob,
    handleAddCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer
  } = useWorkPlanner();

  const handleAddCustomerLocation = (location: { lat: number; lng: number }) => {
    // Create a new customer at the clicked location with required fields
    handleAddCustomer({
      name: 'New Customer',
      address: 'Click to edit address',
      latitude: location.lat,
      longitude: location.lng,
      email: '',  // Adding required fields for the updated type
      phone: '', 
      notes: ''
    });
  };

  return (
    <MapOverview
      jobs={jobs}
      customers={customers}
      rounds={rounds}
      selectedDate={selectedDate}
      selectedRound={selectedRound}
      onEditJob={handleEditJob}
      onCompleteJob={handleCompleteJob}
      onDeleteJob={handleDeleteJob}
      onUpdateJob={handleUpdateJob}
      onSelectRound={onSelectRound}
      onAddCustomerLocation={handleAddCustomerLocation}
      onAddCustomer={handleAddCustomer}
      onUpdateCustomer={handleUpdateCustomer}
      onDeleteCustomer={handleDeleteCustomer}
      isLoading={isLoading}
      error={error}
    />
  );
};

const PlannerWrapper: React.FC<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}> = ({ selectedDate, onDateChange }) => {
  const {
    jobs,
    customers,
    rounds,
    isLoading,
    error,
    handleEditJob,
    handleCompleteJob,
    handleDeleteJob,
    handleUpdateJob,
    handleGenerateRecurringJobs
  } = useWorkPlanner();

  return (
    <WorkPlanner
      jobs={jobs}
      customers={customers}
      rounds={rounds}
      selectedDate={selectedDate}
      onDateChange={onDateChange}
      onEditJob={handleEditJob}
      onCompleteJob={handleCompleteJob}
      onDeleteJob={handleDeleteJob}
      onUpdateJob={handleUpdateJob}
      onGenerateRecurringJobs={handleGenerateRecurringJobs}
      isLoading={isLoading}
      error={error}
    />
  );
};

const CustomerWrapper: React.FC = () => {
  const {
    customers,
    isLoading,
    error,
    handleAddCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer
  } = useWorkPlanner();

  return (
    <CustomerManagement
      customers={customers}
      onAddCustomer={handleAddCustomer}
      onUpdateCustomer={handleUpdateCustomer}
      onDeleteCustomer={handleDeleteCustomer}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default App;
