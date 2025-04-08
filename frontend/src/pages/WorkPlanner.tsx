import React, { useState, useEffect } from 'react';
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
  Paper,
  Divider,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Job, WorkPlannerProps, Customer, Round } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isEqual, parseISO, addWeeks, subWeeks, isSameDay } from 'date-fns';

const WorkPlanner: React.FC<WorkPlannerProps> = ({
  jobs,
  customers,
  rounds,
  selectedDate,
  onDateChange,
  onEditJob,
  onCompleteJob,
  onDeleteJob,
  onUpdateJob,
  onGenerateRecurringJobs,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [activeTab, setActiveTab] = useState(0);
  const [isGenerateJobsDialogOpen, setIsGenerateJobsDialogOpen] = useState(false);
  const [generationDateRange, setGenerationDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(),
    end: addDays(new Date(), 30)
  });

  // Get start and end of week for the selected date
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Function to get jobs for a specific day
  const getJobsForDay = (date: Date) => {
    return jobs.filter(job => {
      const jobDate = parseISO(job.scheduledDate);
      return isSameDay(jobDate, date);
    });
  };

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

  const createNewJob = async () => {
    const defaultCustomer = customers.length > 0 ? customers[0].id : '';
    
    const newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: defaultCustomer,
      roundId: undefined,
      title: 'New Service',
      description: '',
      scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
      scheduledTime: '09:00',
      duration: 60,
      status: 'scheduled',
      recurrence: 'none',
      price: 0,
      notes: '',
    };
    
    setEditingJob(newJob as Job);
    setIsNewJobDialogOpen(true);
  };

  const handleSaveNewJob = async () => {
    if (editingJob) {
      await onUpdateJob(editingJob);
      setIsNewJobDialogOpen(false);
      setEditingJob(null);
    }
  };

  const handleCloseNewJobDialog = () => {
    setIsNewJobDialogOpen(false);
    setEditingJob(null);
  };

  const handleCompleteJob = async (jobId: string) => {
    await onCompleteJob(jobId);
  };

  const handleSkipJob = async (job: Job) => {
    const updatedJob = { ...job, status: 'skipped' as const };
    await onUpdateJob(updatedJob);
  };

  const handleReplanJob = (job: Job) => {
    setEditingJob(job);
    setIsEditDialogOpen(true);
  };

  const handleGenerateRecurringJobs = async () => {
    await onGenerateRecurringJobs(generationDateRange.start, generationDateRange.end);
    setIsGenerateJobsDialogOpen(false);
  };

  const handlePreviousWeek = () => {
    onDateChange(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(selectedDate, 1));
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'calendar' | 'list' | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  function getStatusColor(status: string): "success" | "error" | "warning" | "info" | "default" | "primary" | "secondary" {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'skipped':
        return 'default';
      default:
        return 'default';
    }
  }

  const filteredJobs = jobs?.filter(job => {
    switch (activeTab) {
      case 0: // All
        return true;
      case 1: // Scheduled
        return job.status === 'scheduled';
      case 2: // Completed
        return job.status === 'completed';
      case 3: // Cancelled
        return job.status === 'cancelled' || job.status === 'skipped';
      default:
        return true;
    }
  }) || [];

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

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  };

  const getRoundById = (id: string | undefined): Round | undefined => {
    if (!id) return undefined;
    return rounds.find(round => round.id === id);
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Work Planner
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker 
              label="Select Date" 
              value={selectedDate}
              onChange={(newDate) => newDate && onDateChange(newDate)}
              slotProps={{ textField: { size: 'small' } }}
            />
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="calendar" aria-label="calendar view">
                <CalendarViewWeekIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={createNewJob}
              size="small"
            >
              New Job
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<EventRepeatIcon />}
              onClick={() => setIsGenerateJobsDialogOpen(true)}
              size="small"
            >
              Generate Jobs
            </Button>
          </Box>
        </Box>
        
        {viewMode === 'calendar' && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handlePreviousWeek}>
                <NavigateBeforeIcon />
              </IconButton>
              
              <Typography variant="h6">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </Typography>
              
              <IconButton onClick={handleNextWeek}>
                <NavigateNextIcon />
              </IconButton>
            </Box>
            
            <Grid container spacing={1}>
              {/* Day headers */}
              {daysOfWeek.map((day) => (
                <Grid item xs key={day.toISOString()} sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                      color: isSameDay(day, new Date()) ? 'primary.main' : 'text.primary',
                      pb: 1,
                    }}
                  >
                    {format(day, 'EEE')}
                    <br />
                    {format(day, 'd')}
                  </Typography>
                </Grid>
              ))}
              
              {/* Day columns with jobs */}
              {daysOfWeek.map((day) => {
                const dayJobs = getJobsForDay(day);
                return (
                  <Grid item xs key={`jobs-${day.toISOString()}`}>
                    <Paper 
                      sx={{ 
                        height: 500, 
                        overflow: 'auto',
                        bgcolor: isSameDay(day, new Date()) ? 'rgba(0, 0, 0, 0.03)' : 'background.paper',
                        p: 1,
                      }}
                      variant="outlined"
                    >
                      {dayJobs.length === 0 ? (
                        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">No jobs</Typography>
                        </Box>
                      ) : (
                        dayJobs.map((job) => {
                          const customer = getCustomerById(job.customerId);
                          const round = getRoundById(job.roundId);
                          
                          return (
                            <Paper
                              key={job.id}
                              sx={{
                                mb: 1,
                                p: 1,
                                borderLeft: `4px solid ${round?.color || getStatusColor(job.status)}`,
                                '&:hover': {
                                  boxShadow: 1,
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                    {job.title}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.9rem' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {customer?.name || 'Unknown customer'}
                                    </Typography>
                                  </Box>
                                  
                                  {job.scheduledTime && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.9rem' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        {job.scheduledTime} ({job.duration} min)
                                      </Typography>
                                    </Box>
                                  )}
                                  
                                  {job.price && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                      <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.9rem' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        £{job.price}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                
                                <Chip 
                                  size="small" 
                                  label={job.status} 
                                  color={getStatusColor(job.status)}
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                {job.status === 'scheduled' && (
                                  <>
                                    <Tooltip title="Complete">
                                      <IconButton size="small" onClick={() => handleCompleteJob(job.id)}>
                                        <CheckCircleOutlineIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Skip">
                                      <IconButton size="small" onClick={() => handleSkipJob(job)}>
                                        <SkipNextIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Replan">
                                      <IconButton size="small" onClick={() => handleReplanJob(job)}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                                
                                {(job.status === 'completed' || job.status === 'skipped') && (
                                  <Tooltip title="Delete">
                                    <IconButton size="small" onClick={() => onDeleteJob(job.id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </Paper>
                          );
                        })
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}
        
        {viewMode === 'list' && (
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="All" />
              <Tab label="Scheduled" />
              <Tab label="Completed" />
              <Tab label="Cancelled/Skipped" />
            </Tabs>
            
            {filteredJobs.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">No jobs found</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredJobs.map(job => {
                  const customer = getCustomerById(job.customerId);
                  const round = getRoundById(job.roundId);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={job.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s',
                          borderTop: `4px solid ${round?.color || getStatusColor(job.status)}`,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3,
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                              {job.title}
                            </Typography>
                            <Chip 
                              label={job.status} 
                              color={getStatusColor(job.status)}
                              size="small"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon color="action" fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {customer?.name || 'Unknown customer'}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarViewWeekIcon color="action" fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {format(parseISO(job.scheduledDate), 'EEEE, MMMM d, yyyy')}
                              </Typography>
                            </Box>

                            {job.scheduledTime && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon color="action" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                  {job.scheduledTime} ({job.duration} min)
                                </Typography>
                              </Box>
                            )}
                            
                            {customer && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon color="action" fontSize="small" />
                                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                  {customer.address}
                                </Typography>
                              </Box>
                            )}
                            
                            {job.price && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachMoneyIcon color="action" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                  £{job.price}
                                </Typography>
                              </Box>
                            )}
                            
                            {job.recurrence && job.recurrence !== 'none' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventRepeatIcon color="action" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                  {job.recurrence.charAt(0).toUpperCase() + job.recurrence.slice(1)}
                                </Typography>
                              </Box>
                            )}
                            
                            {job.notes && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  "{job.notes}"
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ p: 1.5, pt: 0 }}>
                          {job.status === 'scheduled' && (
                            <ButtonGroup size="small" fullWidth>
                              <Button 
                                startIcon={<CheckCircleOutlineIcon />} 
                                onClick={() => handleCompleteJob(job.id)}
                                color="success"
                              >
                                Complete
                              </Button>
                              <Button 
                                startIcon={<SkipNextIcon />} 
                                onClick={() => handleSkipJob(job)}
                                color="warning"
                              >
                                Skip
                              </Button>
                              <Button 
                                startIcon={<EditIcon />} 
                                onClick={() => handleReplanJob(job)}
                                color="primary"
                              >
                                Edit
                              </Button>
                            </ButtonGroup>
                          )}
                          
                          {(job.status === 'completed' || job.status === 'skipped' || job.status === 'cancelled') && (
                            <Button 
                              startIcon={<DeleteIcon />} 
                              onClick={() => onDeleteJob(job.id)}
                              color="error"
                              fullWidth
                              size="small"
                            >
                              Delete
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="All" />
            <Tab label="Scheduled" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredJobs.map(job => (
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
                      {job.title}
                    </Typography>
                    <Chip 
                      label={job.status} 
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
                      <CalendarViewWeekIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {job.date} at {job.time}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {job.location?.address || 'No address'}
                      </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
                      £{job.price}
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
          ))}
        </Grid>

        {/* Edit Job Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{editingJob ? 'Edit Job' : 'New Job'}</DialogTitle>
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
                  label="Round"
                  select
                  value={editingJob.roundId || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, roundId: e.target.value || undefined })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="">No Round</MenuItem>
                  {rounds.map((round) => (
                    <MenuItem key={round.id} value={round.id}>
                      {round.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Date"
                  type="date"
                  value={editingJob.scheduledDate || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, scheduledDate: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={editingJob.scheduledTime || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, scheduledTime: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={editingJob.duration || 60}
                  onChange={(e) => setEditingJob({ ...editingJob, duration: parseInt(e.target.value) || 60 })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Status"
                  select
                  value={editingJob.status || 'scheduled'}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    status: e.target.value as 'scheduled' | 'completed' | 'cancelled' | 'skipped' 
                  })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="skipped">Skipped</MenuItem>
                </TextField>
                <TextField
                  label="Recurrence"
                  select
                  value={editingJob.recurrence || 'none'}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    recurrence: e.target.value as 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
                  })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Biweekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
                <TextField
                  label="Price"
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
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

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
                  label="Round"
                  select
                  value={editingJob.roundId || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, roundId: e.target.value || undefined })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="">No Round</MenuItem>
                  {rounds.map((round) => (
                    <MenuItem key={round.id} value={round.id}>
                      {round.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Date"
                  type="date"
                  value={editingJob.scheduledDate || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, scheduledDate: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={editingJob.scheduledTime || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, scheduledTime: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={editingJob.duration || 60}
                  onChange={(e) => setEditingJob({ ...editingJob, duration: parseInt(e.target.value) || 60 })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Recurrence"
                  select
                  value={editingJob.recurrence || 'none'}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    recurrence: e.target.value as 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
                  })}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Biweekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
                <TextField
                  label="Price"
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
            <Button onClick={handleCloseNewJobDialog}>Cancel</Button>
            <Button onClick={handleSaveNewJob} variant="contained" color="primary">
              Create Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* Generate Jobs Dialog */}
        <Dialog
          open={isGenerateJobsDialogOpen}
          onClose={() => setIsGenerateJobsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Generate Recurring Jobs</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={format(generationDateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setGenerationDateRange({ ...generationDateRange, start: new Date(e.target.value) })}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={format(generationDateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setGenerationDateRange({ ...generationDateRange, end: new Date(e.target.value) })}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsGenerateJobsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateRecurringJobs} variant="contained" color="primary">
              Generate Jobs
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default WorkPlanner; 