import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  ListItemSecondaryAction,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { addWeeks, format } from 'date-fns';
import WorkPlanner from './WorkPlanner';
import { Job, DashboardProps } from '../types';

const rounds = ['Worthing', 'Arundel', 'Haywards Heath'];

const Dashboard: React.FC<DashboardProps> = ({ jobs, setJobs }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'planner'>('calendar');

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsEditDialogOpen(true);
  };

  const handleSaveJob = () => {
    if (editingJob) {
      setJobs((prevJobs: Job[]) => 
        prevJobs.map((job: Job) => 
          job.id === editingJob.id ? editingJob : job
        )
      );
      setIsEditDialogOpen(false);
      setEditingJob(null);
    }
  };

  const handleSkipJob = (jobId: string) => {
    setJobs((prevJobs: Job[]) => 
      prevJobs.map((job: Job) => 
        job.id === jobId ? { ...job, status: 'skipped' } : job
      )
    );
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prevJobs: Job[]) => 
      prevJobs.filter((job: Job) => job.id !== jobId)
    );
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((prevJobs: Job[]) => 
      prevJobs.map((job: Job) => 
        job.id === updatedJob.id ? updatedJob : job
      )
    );
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return jobs.filter(job => job.date === dateStr);
  };

  const filteredJobs = jobs.filter(job => {
    if (!selectedDate) return false;
    const jobDate = new Date(job.date);
    return (
      jobDate.getDate() === selectedDate.getDate() &&
      jobDate.getMonth() === selectedDate.getMonth() &&
      jobDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, newView) => newView && setView(newView)}
          aria-label="view toggle"
        >
          <ToggleButton value="calendar" aria-label="calendar view">
            Calendar View
          </ToggleButton>
          <ToggleButton value="planner" aria-label="work planner view">
            Work Planner
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'calendar' ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue) => newValue && setSelectedDate(newValue)}
              sx={{ mb: 2 }}
            />
          </LocalizationProvider>
          <Paper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ p: 2 }}>
              Jobs for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            <List>
              {filteredJobs.map((job) => (
                <ListItem
                  key={job.id}
                  sx={{
                    borderBottom: '1px solid #eee',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {job.customer}
                        </Typography>
                        <Chip
                          label={job.round}
                          color="secondary"
                          size="small"
                        />
                        <Chip
                          label={`£${job.price}`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={job.status}
                          color={
                            job.status === 'completed' ? 'success' :
                            job.status === 'skipped' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">
                          {job.service} - {job.time}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Every {job.frequency} weeks
                        </Typography>
                        {job.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Notes: {job.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleEditJob(job)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleSkipJob(job.id)}>
                      <SkipNextIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDeleteJob(job.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      ) : (
        <WorkPlanner
          jobs={jobs}
          onEditJob={handleEditJob}
          onCompleteJob={handleSkipJob}
          onDeleteJob={handleDeleteJob}
          onUpdateJob={handleUpdateJob}
        />
      )}

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Job</DialogTitle>
        <DialogContent>
          {editingJob && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Customer"
                value={editingJob.customer}
                onChange={(e) => setEditingJob({ ...editingJob, customer: e.target.value })}
                fullWidth
              />
              <TextField
                label="Address"
                value={editingJob.address}
                onChange={(e) => setEditingJob({ ...editingJob, address: e.target.value })}
                fullWidth
              />
              <TextField
                label="Service"
                value={editingJob.service}
                onChange={(e) => setEditingJob({ ...editingJob, service: e.target.value })}
                fullWidth
              />
              <TextField
                label="Price"
                type="number"
                value={editingJob.price}
                onChange={(e) => setEditingJob({ ...editingJob, price: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Time"
                type="time"
                value={editingJob.time}
                onChange={(e) => setEditingJob({ ...editingJob, time: e.target.value })}
                fullWidth
              />
              <TextField
                label="Status"
                select
                value={editingJob.status}
                onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as Job['status'] })}
                fullWidth
              >
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="skipped">Skipped</MenuItem>
              </TextField>
              <TextField
                label="Notes"
                value={editingJob.notes}
                onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveJob} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total Jobs</Typography>
          <Typography variant="h4">{totalJobs}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Completed Jobs</Typography>
          <Typography variant="h4">{completedJobs}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Pending Jobs</Typography>
          <Typography variant="h4">{pendingJobs}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Jobs
        </Typography>
        {jobs.length === 0 ? (
          <Typography>No jobs available</Typography>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
            {jobs.slice(0, 5).map(job => (
              <Box 
                component="li" 
                key={job.id}
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle1">{job.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {job.status}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard; 