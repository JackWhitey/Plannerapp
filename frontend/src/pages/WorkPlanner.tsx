import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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

interface WorkPlannerProps {
  jobs: Job[];
  onEditJob: (job: Job) => void;
  onCompleteJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateJob: (job: Job) => void;
}

const WorkPlanner: React.FC<WorkPlannerProps> = ({
  jobs,
  onEditJob,
  onCompleteJob,
  onDeleteJob,
  onUpdateJob,
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getJobsForDay = (date: Date) => {
    return jobs.filter(job => isSameDay(parseISO(job.date), date));
  };

  const handlePreviousWeek = () => {
    setStartDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setStartDate(prev => addDays(prev, 7));
  };

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', job.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedJob) return;

    const updatedJob = {
      ...draggedJob,
      date: format(targetDate, 'yyyy-MM-dd'),
    };

    onUpdateJob(updatedJob);
    setDraggedJob(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePreviousWeek}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
        </Typography>
        <IconButton onClick={handleNextWeek}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {days.map((day) => (
          <Grid item xs={12} sm={6} md={4} lg={12/7} key={day.toString()}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: '100%',
                minHeight: '200px',
                bgcolor: isSameDay(day, new Date()) ? 'action.hover' : 'background.paper',
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <Typography variant="subtitle1" gutterBottom>
                {format(day, 'EEEE, MMM d')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minHeight: '100px',
                  p: 1,
                }}
              >
                {getJobsForDay(day).map((job) => (
                  <Paper
                    key={job.id}
                    elevation={1}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job)}
                    sx={{
                      p: 1,
                      bgcolor: job.status === 'completed' ? 'success.light' : 'background.paper',
                      cursor: 'move',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, flex: 1, minWidth: 0 }}>
                          <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                mb: 0.5,
                              }}
                            >
                              {job.customer}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                fontSize: '0.8rem',
                                lineHeight: 1.2,
                                mb: 0.5,
                              }}
                            >
                              {job.service}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                fontSize: '0.8rem',
                                lineHeight: 1.2,
                              }}
                            >
                              {job.time} - {job.address}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit job details">
                            <IconButton size="small" onClick={() => onEditJob(job)} sx={{ p: 0.5 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Complete job and schedule next occurrence">
                            <IconButton size="small" onClick={() => onCompleteJob(job.id)} sx={{ p: 0.5 }}>
                              <SkipNextIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete job">
                            <IconButton size="small" onClick={() => onDeleteJob(job.id)} sx={{ p: 0.5 }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                          label={job.round}
                          color="secondary"
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Chip
                          label={`£${job.price}`}
                          color="primary"
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WorkPlanner; 