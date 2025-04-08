import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Job, DashboardProps } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { format } from 'date-fns';

const Dashboard: React.FC<DashboardProps> = ({
  jobs,
  onEditJob,
  onCompleteJob,
  onDeleteJob,
  onUpdateJob,
  isLoading,
  error,
  customers,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [isNewQuoteDialogOpen, setIsNewQuoteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingJob(null);
  };

  const handleSave = async () => {
    if (editingJob) {
      await onUpdateJob(editingJob);
      handleDialogClose();
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredJobs = jobs?.filter(job => {
    if (!job) {
      console.warn('Encountered undefined job:', job);
      return false;
    }
    switch (activeTab) {
      case 0: // All
        return true;
      case 1: // Scheduled
        return job.status === 'scheduled';
      case 2: // Completed
        return job.status === 'completed';
      case 3: // Cancelled
        return job.status === 'cancelled';
      default:
        return true;
    }
  }) || [];

  console.log('Filtered jobs:', filteredJobs);

  const createNewJob = async () => {
    const newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: '',
      title: 'New Job',
      service: 'window_cleaning',
      status: 'scheduled',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      price: 0,
      location: {
        address: '',
        latitude: 0,
        longitude: 0
      },
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledTime: '09:00',
      duration: 60
    };
    
    setEditingJob(newJob as Job);
    setIsNewJobDialogOpen(true);
  };

  const createNewQuote = async () => {
    const newQuote: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: '',
      title: 'New Quote',
      service: 'window_cleaning',
      status: 'scheduled',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      price: 0,
      location: {
        address: '',
        latitude: 0,
        longitude: 0
      },
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledTime: '09:00',
      duration: 60
    };
    
    setEditingJob(newQuote as Job);
    setIsNewQuoteDialogOpen(true);
  };

  const handleSaveNewJob = async () => {
    if (editingJob) {
      await onUpdateJob(editingJob);
      setIsNewJobDialogOpen(false);
      setEditingJob(null);
    }
  };

  const handleSaveNewQuote = async () => {
    if (editingJob) {
      // Mark this as a quote rather than a scheduled job
      const quoteJob = {
        ...editingJob,
        status: 'scheduled' as const,
        title: `Quote - ${editingJob.title}`,
      };
      await onUpdateJob(quoteJob);
      setIsNewQuoteDialogOpen(false);
      setEditingJob(null);
    }
  };

  const handleCloseNewJobDialog = () => {
    setIsNewJobDialogOpen(false);
    setEditingJob(null);
  };

  const handleCloseNewQuoteDialog = () => {
    setIsNewQuoteDialogOpen(false);
    setEditingJob(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No jobs found
        </Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
          >
            <Tab label="All" />
            <Tab label="Scheduled" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredJobs.map(job => {
            if (!job) return null;
            return (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                        {job.title || 'Untitled Job'}
                      </Typography>
                      <Chip 
                        label={job.status || 'scheduled'} 
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {customers?.find(c => c.id === job.customerId)?.name || 'No customer'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {job.service?.replace('_', ' ') || 'No service specified'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {job.location?.address || 'No address'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {job.date || 'No date'} at {job.time || 'No time'}
                        </Typography>
                      </Box>

                      <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
                        £{job.price || 0}
                      </Typography>

                      {job.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {job.notes}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Tooltip title="Edit job">
                      <IconButton onClick={() => handleEditClick(job)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Complete job">
                      <IconButton onClick={() => onCompleteJob(job.id)} size="small">
                        <SkipNextIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete job">
                      <IconButton onClick={() => onDeleteJob(job.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Dialog 
          open={isEditDialogOpen} 
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Job</DialogTitle>
          <DialogContent>
            {editingJob && (
              <Box sx={{ pt: 2 }}>
                <TextField
                  label="Title"
                  value={editingJob.title || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Customer"
                  select
                  value={editingJob.customerId || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, customerId: e.target.value })}
                  fullWidth
                  margin="normal"
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Service"
                  select
                  value={editingJob.service || 'window_cleaning'}
                  onChange={(e) => 
                    setEditingJob({ 
                      ...editingJob, 
                      service: e.target.value as 'window_cleaning' | 'gutter_cleaning' | 'pressure_washing' | 'other'
                    })
                  }
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="window_cleaning">Window Cleaning</MenuItem>
                  <MenuItem value="gutter_cleaning">Gutter Cleaning</MenuItem>
                  <MenuItem value="pressure_washing">Pressure Washing</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                  label="Address"
                  value={editingJob.location?.address || ''}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    location: {
                      ...editingJob.location,
                      address: e.target.value,
                      latitude: editingJob.location?.latitude || 0,
                      longitude: editingJob.location?.longitude || 0
                    }
                  })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Date"
                  type="date"
                  value={editingJob.date || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, date: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={editingJob.time || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, time: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={editingJob.price || 0}
                  onChange={(e) => setEditingJob({ ...editingJob, price: Number(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Status"
                  select
                  value={editingJob.status || 'scheduled'}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    status: e.target.value as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
                  })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
                <TextField
                  label="Recurring"
                  select
                  value={editingJob.recurring?.frequency || 'custom'}
                  onChange={(e) => {
                    const frequency = e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'custom';
                    let interval = editingJob.recurring?.interval || 0;
                    
                    // Set default intervals based on frequency
                    if (frequency === 'weekly') interval = 1;
                    else if (frequency === 'biweekly') interval = 2;
                    else if (frequency === 'monthly') interval = 4;
                    
                    setEditingJob({
                      ...editingJob,
                      recurring: {
                        ...(editingJob.recurring || {}),
                        frequency,
                        interval
                      }
                    });
                  }}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </TextField>
                {editingJob.recurring?.frequency === 'custom' && (
                  <TextField
                    label="Interval (weeks)"
                    type="number"
                    value={editingJob.recurring?.interval || 0}
                    onChange={(e) => setEditingJob({
                      ...editingJob,
                      recurring: {
                        ...(editingJob.recurring || {}),
                        frequency: editingJob.recurring?.frequency || 'custom',
                        interval: Number(e.target.value)
                      }
                    })}
                    fullWidth
                    margin="normal"
                  />
                )}
                <TextField
                  label="Notes"
                  value={editingJob.notes || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Speed Dial FAB */}
        <SpeedDial
          ariaLabel="Job Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          <SpeedDialAction
            icon={<PostAddIcon />}
            tooltipTitle="New Job"
            tooltipOpen
            onClick={createNewJob}
          />
          <SpeedDialAction
            icon={<ReceiptIcon />}
            tooltipTitle="New Quote"
            tooltipOpen
            onClick={createNewQuote}
          />
        </SpeedDial>

        {/* New Job Dialog */}
        <Dialog 
          open={isNewJobDialogOpen} 
          onClose={handleCloseNewJobDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>New Job</DialogTitle>
          <DialogContent>
            {editingJob && (
              <Box sx={{ pt: 2 }}>
                <TextField
                  label="Title"
                  value={editingJob.title || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Customer"
                  select
                  value={editingJob.customerId || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, customerId: e.target.value })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="" disabled>Select a customer</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Service"
                  select
                  value={editingJob.service || 'window_cleaning'}
                  onChange={(e) => 
                    setEditingJob({ 
                      ...editingJob, 
                      service: e.target.value as 'window_cleaning' | 'gutter_cleaning' | 'pressure_washing' | 'other'
                    })
                  }
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="window_cleaning">Window Cleaning</MenuItem>
                  <MenuItem value="gutter_cleaning">Gutter Cleaning</MenuItem>
                  <MenuItem value="pressure_washing">Pressure Washing</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                  label="Address"
                  value={editingJob.location?.address || ''}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    location: {
                      ...editingJob.location,
                      address: e.target.value,
                      latitude: editingJob.location?.latitude || 0,
                      longitude: editingJob.location?.longitude || 0
                    }
                  })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Date"
                  type="date"
                  value={editingJob.date || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, date: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={editingJob.time || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, time: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={editingJob.price || 0}
                  onChange={(e) => setEditingJob({ ...editingJob, price: Number(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Recurring"
                  select
                  value={editingJob.recurring?.frequency || 'custom'}
                  onChange={(e) => {
                    const frequency = e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'custom';
                    let interval = editingJob.recurring?.interval || 0;
                    
                    // Set default intervals based on frequency
                    if (frequency === 'weekly') interval = 1;
                    else if (frequency === 'biweekly') interval = 2;
                    else if (frequency === 'monthly') interval = 4;
                    
                    setEditingJob({
                      ...editingJob,
                      recurring: {
                        ...(editingJob.recurring || {}),
                        frequency,
                        interval
                      }
                    });
                  }}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </TextField>
                {editingJob.recurring?.frequency === 'custom' && (
                  <TextField
                    label="Interval (weeks)"
                    type="number"
                    value={editingJob.recurring?.interval || 0}
                    onChange={(e) => setEditingJob({
                      ...editingJob,
                      recurring: {
                        ...(editingJob.recurring || {}),
                        frequency: editingJob.recurring?.frequency || 'custom',
                        interval: Number(e.target.value)
                      }
                    })}
                    fullWidth
                    margin="normal"
                  />
                )}
                <TextField
                  label="Notes"
                  value={editingJob.notes || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewJobDialog}>Cancel</Button>
            <Button onClick={handleSaveNewJob} variant="contained" color="primary">
              Save Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Quote Dialog - Similar to New Job but with different title and save action */}
        <Dialog 
          open={isNewQuoteDialogOpen} 
          onClose={handleCloseNewQuoteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>New Quote</DialogTitle>
          <DialogContent>
            {editingJob && (
              <Box sx={{ pt: 2 }}>
                <TextField
                  label="Title"
                  value={editingJob.title || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Customer"
                  select
                  value={editingJob.customerId || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, customerId: e.target.value })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="" disabled>Select a customer</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Service"
                  select
                  value={editingJob.service || 'window_cleaning'}
                  onChange={(e) => 
                    setEditingJob({ 
                      ...editingJob, 
                      service: e.target.value as 'window_cleaning' | 'gutter_cleaning' | 'pressure_washing' | 'other'
                    })
                  }
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="window_cleaning">Window Cleaning</MenuItem>
                  <MenuItem value="gutter_cleaning">Gutter Cleaning</MenuItem>
                  <MenuItem value="pressure_washing">Pressure Washing</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                  label="Address"
                  value={editingJob.location?.address || ''}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    location: {
                      ...editingJob.location,
                      address: e.target.value,
                      latitude: editingJob.location?.latitude || 0,
                      longitude: editingJob.location?.longitude || 0
                    }
                  })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Estimated Price"
                  type="number"
                  value={editingJob.price || 0}
                  onChange={(e) => setEditingJob({ ...editingJob, price: Number(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Notes"
                  value={editingJob.notes || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewQuoteDialog}>Cancel</Button>
            <Button onClick={handleSaveNewQuote} variant="contained" color="primary">
              Save Quote
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default Dashboard; 