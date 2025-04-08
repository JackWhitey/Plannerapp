import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Badge,
  Snackbar,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimerIcon from '@mui/icons-material/Timer';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NoteIcon from '@mui/icons-material/Note';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Job, Customer, MapOverviewProps } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { format } from 'date-fns';
import { verifyAddress, getAddressSuggestions, AddressSuggestion } from '../utils/geocoding';
import { debounce } from 'lodash';
import config from '../config';

type MarkerType = 'job' | 'customer';

interface VerificationResult {
  verified: boolean;
  message: string;
}

interface JobMarkerProps {
  job: Job;
  onClick: () => void;
  statusColor: string;
}

const JobMarker: React.FC<JobMarkerProps> = ({ job, onClick, statusColor }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translate(-50%, -50%) scale(1.2)',
        },
      }}
    >
      <LocationOnIcon
        sx={{
          fontSize: 32,
          color: statusColor,
        }}
      />
    </Box>
  );
};

interface CustomerMarkerProps {
  customer: Customer;
  onClick: () => void;
  isVerified?: boolean;
}

const CustomerMarker: React.FC<CustomerMarkerProps> = ({ customer, onClick, isVerified = false }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translate(-50%, -50%) scale(1.2)',
        },
      }}
    >
      {isVerified ? (
        <Badge
          badgeContent={<VerifiedIcon sx={{ fontSize: 14 }} />}
          color="success"
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <PersonIcon
            sx={{
              fontSize: 32,
              color: '#1976d2', // Primary color
            }}
          />
        </Badge>
      ) : (
        <PersonIcon
          sx={{
            fontSize: 32,
            color: '#1976d2', // Primary color
          }}
        />
      )}
    </Box>
  );
};

const MapOverview: React.FC<MapOverviewProps> = ({
  jobs,
  customers,
  rounds,
  selectedDate,
  selectedRound,
  onEditJob,
  onCompleteJob,
  onDeleteJob,
  onUpdateJob,
  onSelectRound,
  onAddCustomerLocation,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewport, setViewport] = useState({
    latitude: 50.8195,
    longitude: -0.3713,
    zoom: 12
  });
  const [markerFilter, setMarkerFilter] = useState<MarkerType[]>(['job', 'customer']);
  const [jobStatusFilter, setJobStatusFilter] = useState<string[]>(['scheduled', 'in_progress', 'completed', 'cancelled']);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [isNewQuoteDialogOpen, setIsNewQuoteDialogOpen] = useState(false);
  const [newJobData, setNewJobData] = useState<Partial<Job> | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [isPlacingNewJobMarker, setIsPlacingNewJobMarker] = useState(false);
  const [isPlacingNewQuoteMarker, setIsPlacingNewQuoteMarker] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    latitude: 0,
    longitude: 0,
  });
  const [addressVerificationResult, setAddressVerificationResult] = useState<VerificationResult | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedAddressSuggestion, setSelectedAddressSuggestion] = useState<AddressSuggestion | null>(null);

  // Center the map on the selected round
  useEffect(() => {
    if (selectedRound) {
      const round = rounds.find(r => r.id === selectedRound);
      if (round) {
        setViewport({
          latitude: round.area?.center?.latitude ?? 51.5074,
          longitude: round.area?.center?.longitude ?? -0.1278,
          zoom: 12
        });
      }
    }
  }, [selectedRound, rounds]);

  const handleMarkerFilterChange = (event: React.MouseEvent<HTMLElement>, newFormats: MarkerType[]) => {
    if (newFormats.length > 0) {
      setMarkerFilter(newFormats);
    }
  };

  const handleJobStatusFilterChange = (event: React.MouseEvent<HTMLElement>, newStatuses: string[]) => {
    if (newStatuses.length > 0) {
      setJobStatusFilter(newStatuses);
    }
  };

  const handleCompleteJob = (jobId: string) => {
    setCompletionNotes('');
    setIsCompletionDialogOpen(true);
  };

  const handleConfirmCompletion = () => {
    if (selectedJob) {
      onCompleteJob(selectedJob.id, completionNotes);
      setIsCompletionDialogOpen(false);
      setSelectedJob(null);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCustomerForJob = (job: Job): Customer | undefined => {
    return customers.find(c => c.id === job.customerId);
  };

  // Filter jobs based on selected date, round, and status
  /* eslint-disable-next-line */
  const filteredJobs = jobs.filter(job => {
    // Filter by status
    if (!jobStatusFilter.includes(job.status)) return false;
    
    // Filter by date if selected
    if (selectedDate && job.date !== format(selectedDate, 'yyyy-MM-dd')) return false;
    
    // Filter by round if selected
    if (selectedRound && job.location?.round !== rounds.find(r => r.id === selectedRound)?.name) return false;
    
    return true;
  });

  // Filter customers based on selected round
  /* eslint-disable-next-line */
  const filteredCustomers = customers.filter(customer => {
    // Filter by round if selected
    if (selectedRound) {
      const round = rounds.find(r => r.id === selectedRound);
      if (round) {
        return round.customers?.includes(customer.id) ?? false;
      }
      return false;
    }
    return true;
  });

  const handleMapClick = (event: any) => {
    // Get click coordinates
    const [longitude, latitude] = event.lngLat;
    
    if (isPlacingNewJobMarker || isPlacingNewQuoteMarker) {
      // We're in job/quote creation mode, so find the nearest customer
      const nearestCustomer = customers.reduce(
        (nearest, current) => {
          const distance = Math.sqrt(
            Math.pow(current.latitude - latitude, 2) + 
            Math.pow(current.longitude - longitude, 2)
          );
          return distance < nearest.distance ? { customer: current, distance } : nearest;
        },
        { customer: null as Customer | null, distance: Infinity }
      );

      // If a customer is found within a reasonable distance
      if (nearestCustomer.customer && nearestCustomer.distance < 0.01) {
        const jobData = {
          customerId: nearestCustomer.customer.id,
          title: 'New Job',
          scheduledDate: format(selectedDate || new Date(), 'yyyy-MM-dd'),
          scheduledTime: '09:00',
          duration: 60,
          status: 'scheduled' as const,
          price: 0
        };
        
        setNewJobData(jobData);
        
        if (isPlacingNewJobMarker) {
          setIsNewJobDialogOpen(true);
        } else {
          setIsNewQuoteDialogOpen(true);
        }
      } else {
        // No nearby customer, ask if they want to create a new one at this location
        setClickedLocation({ latitude, longitude });
        
        // Show dialog to add new customer at this location
        setNewCustomerData({
          name: '',
          email: '',
          phone: '',
          address: '',
          notes: '',
          latitude,
          longitude,
        });
        
        setIsNewCustomerDialogOpen(true);
      }
      
      // Exit placement mode
      setIsPlacingNewJobMarker(false);
      setIsPlacingNewQuoteMarker(false);
    } else {
      // Normal map click, add a customer directly at this location
      if (config.features.maps) {
        // Show dialog to add new customer at this location
        setClickedLocation({ latitude, longitude });
        setNewCustomerData({
          name: '',
          email: '',
          phone: '',
          address: '',
          notes: '',
          latitude,
          longitude,
        });
        setIsNewCustomerDialogOpen(true);
      }
    }
  };

  const isCustomerAddressVerified = (customer: Customer): boolean => {
    return customer.latitude !== 0 && customer.longitude !== 0 && customer.address.length > 0;
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await onDeleteCustomer(customerId);
      setNotificationMessage('Customer deleted successfully');
      setNotificationOpen(true);
      setSelectedCustomer(null); // Close the popup
    } catch (error) {
      console.error('Error deleting customer:', error);
      setNotificationMessage('Error deleting customer');
      setNotificationOpen(true);
    }
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  const createNewJob = () => {
    setSpeedDialOpen(false);
    setIsPlacingNewJobMarker(true);
  };

  const createNewQuote = () => {
    setSpeedDialOpen(false);
    setIsPlacingNewQuoteMarker(true);
  };

  const handleAddNewCustomer = () => {
    setSpeedDialOpen(false);
    setNewCustomerData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      latitude: 0,
      longitude: 0,
    });
    setAddressVerificationResult(null);
    setIsNewCustomerDialogOpen(true);
  };

  const handleVerifyNewCustomerAddress = async (suggestion?: AddressSuggestion) => {
    if (suggestion) {
      // Use suggestion data directly
      const [longitude, latitude] = suggestion.center;
      
      setAddressVerificationResult({
        verified: true,
        message: `Address verified: ${suggestion.placeName}`
      });
      
      // Center map on verified location
      setViewport({
        ...viewport,
        latitude: latitude,
        longitude: longitude,
        zoom: 15, // Zoom in closer to see the address clearly
      });
      return;
    }
    
    if (!newCustomerData.address) {
      setNotificationMessage('Please enter an address to verify');
      setNotificationOpen(true);
      return;
    }

    try {
      const result = await verifyAddress(newCustomerData.address);
      
      if (result.isVerified) {
        setNewCustomerData({
          ...newCustomerData,
          address: result.formattedAddress,
          latitude: result.location.lat,
          longitude: result.location.lng,
        });
        setAddressVerificationResult({
          verified: true,
          message: `Address verified: ${result.formattedAddress}`
        });
        
        // Center map on verified location
        setViewport({
          ...viewport,
          latitude: result.location.lat,
          longitude: result.location.lng,
          zoom: 15, // Zoom in closer to see the address clearly
        });
      } else {
        setAddressVerificationResult({
          verified: false,
          message: 'Address could not be verified. Please check for accuracy.'
        });
      }
    } catch (error) {
      console.error('Error verifying address:', error);
      setAddressVerificationResult({
        verified: false,
        message: 'Error verifying address'
      });
    }
  };

  const handleSaveNewCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.address) {
      setNotificationMessage('Customer name and address are required');
      setNotificationOpen(true);
      return;
    }

    try {
      // Make sure these values are present
      if (!newCustomerData.latitude || !newCustomerData.longitude) {
        throw new Error('Location coordinates are required');
      }

      // Create customer with verified status based on verification result
      const customerToAdd = {
        ...newCustomerData,
        verified: addressVerificationResult?.verified || false,
      } as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

      const newCustomer = await onAddCustomer(customerToAdd);
      
      // Close dialog and show success message
      setIsNewCustomerDialogOpen(false);
      setNewCustomerData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        latitude: 0,
        longitude: 0,
      });
      setAddressVerificationResult(null);
      setSelectedAddressSuggestion(null);
      
      // Notify user
      setNotificationMessage(`Customer '${newCustomer.name}' added successfully`);
      setNotificationOpen(true);
      
      // If we were in job creation mode, now open the job dialog with this customer
      if (isPlacingNewJobMarker || isPlacingNewQuoteMarker) {
        const jobData = {
          customerId: newCustomer.id,
          title: 'New Job',
          scheduledDate: format(selectedDate || new Date(), 'yyyy-MM-dd'),
          scheduledTime: '09:00',
          duration: 60,
          status: 'scheduled' as const,
          price: 0
        };
        
        setNewJobData(jobData);
        
        if (isPlacingNewJobMarker) {
          setIsNewJobDialogOpen(true);
        } else {
          setIsNewQuoteDialogOpen(true);
        }
        
        // Reset flags
        setIsPlacingNewJobMarker(false);
        setIsPlacingNewQuoteMarker(false);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setNotificationMessage('Error adding customer');
      setNotificationOpen(true);
    }
  };
  
  const handleCloseNewCustomerDialog = () => {
    setIsNewCustomerDialogOpen(false);
    setAddressVerificationResult(null);
    setAddressSuggestions([]);
  };

  const fetchAddressSuggestions = async (query: string) => {
    // UK Postcode pattern to match partial and complete postcodes
    const partialPostcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i;
    const isPartialPostcode = partialPostcodePattern.test(query);
    
    // Allow searching with just 1 character for postcodes
    if (!query || (query.length < 2 && !isPartialPostcode)) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getAddressSuggestions(query);
      setAddressSuggestions(suggestions);
      
      // If we got results but the dropdown isn't showing, trigger it to open
      if (suggestions.length > 0) {
        const event = new Event('input', { bubbles: true });
        const addressField = document.querySelector('input[name="address"]');
        if (addressField) {
          addressField.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setNotificationMessage('Error loading address suggestions. Please try again.');
      setNotificationOpen(true);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const debouncedFetchSuggestions = React.useCallback(
    (query: string) => {
      const handler = debounce(() => {
        fetchAddressSuggestions(query);
      }, 300);
      handler();
      return () => {
        handler.cancel();
      };
    },
    []
  );

  // Add the postcode detection helper function
  const isPostcodeFormat = (text: string): boolean => {
    const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    const partialPostcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i;
    return postcodePattern.test(text) || partialPostcodePattern.test(text);
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Filters */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          {/* Filter controls here */}
          <Typography variant="subtitle1">Show:</Typography>
          <ToggleButtonGroup
            value={markerFilter}
            onChange={handleMarkerFilterChange}
            aria-label="marker type filter"
            size="small"
          >
            <ToggleButton value="job" aria-label="show jobs">
              Jobs
            </ToggleButton>
            <ToggleButton value="customer" aria-label="show customers">
              Customers
            </ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="subtitle1">Job Status:</Typography>
          <ToggleButtonGroup
            value={jobStatusFilter}
            onChange={handleJobStatusFilterChange}
            aria-label="job status filter"
            size="small"
          >
            <ToggleButton value="scheduled" aria-label="scheduled jobs">
              Scheduled
            </ToggleButton>
            <ToggleButton value="in_progress" aria-label="in progress jobs">
              In Progress
            </ToggleButton>
            <ToggleButton value="completed" aria-label="completed jobs">
              Completed
            </ToggleButton>
            <ToggleButton value="cancelled" aria-label="cancelled jobs">
              Cancelled
            </ToggleButton>
          </ToggleButtonGroup>

          {!isMobile && (
            <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="round-filter-label">Round</InputLabel>
              <Select
                labelId="round-filter-label"
                id="round-filter"
                value={selectedRound}
                onChange={(e) => onSelectRound(e.target.value)}
                label="Round"
              >
                <MenuItem value="">All Rounds</MenuItem>
                {rounds.map((round) => (
                  <MenuItem key={round.id} value={round.id}>
                    {round.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Paper>

      {/* Map container */}
      <Box sx={{ flexGrow: 1, height: 'calc(100vh - 250px)', mb: 2, position: 'relative' }}>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <ErrorBoundary name="MapComponent">
            <Map
              mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              initialViewState={{
                ...viewport,
                bearing: 0,
                pitch: 0,
              }}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              style={{ width: '100%', height: '100%' }}
              onMove={(evt) =>
                setViewport({
                  latitude: evt.viewState.latitude,
                  longitude: evt.viewState.longitude,
                  zoom: evt.viewState.zoom,
                })
              }
              onClick={handleMapClick}
            >
              {/* Navigation controls */}
              <NavigationControl position="top-right" />
              <FullscreenControl position="top-right" />
              <GeolocateControl
                position="top-right"
                positionOptions={{ enableHighAccuracy: true }}
                trackUserLocation
              />

              {/* Render job markers */}
              {markerFilter.includes('job') &&
                jobs.filter(job => jobStatusFilter.includes(job.status)).map((job) => {
                  const customer = getCustomerForJob(job);
                  if (!customer) return null;
                  
                  return (
                    <Marker
                      key={`job-${job.id}`}
                      latitude={customer.latitude}
                      longitude={customer.longitude}
                    >
                      <JobMarker
                        job={job}
                        onClick={() => {
                          setSelectedJob(job);
                          setSelectedCustomer(null);
                        }}
                        statusColor={getStatusColor(job.status)}
                      />
                    </Marker>
                  );
                })}

              {/* Render customer markers */}
              {markerFilter.includes('customer') &&
                customers.map((customer) => (
                  <Marker
                    key={`customer-${customer.id}`}
                    latitude={customer.latitude}
                    longitude={customer.longitude}
                  >
                    <CustomerMarker
                      customer={customer}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setSelectedJob(null);
                      }}
                      isVerified={isCustomerAddressVerified(customer)}
                    />
                  </Marker>
                ))}

              {/* Selected job popup */}
              {selectedJob && (
                <Popup
                  latitude={getCustomerForJob(selectedJob)?.latitude || 0}
                  longitude={getCustomerForJob(selectedJob)?.longitude || 0}
                  anchor="bottom"
                  onClose={() => setSelectedJob(null)}
                  closeOnClick={false}
                >
                  <Paper sx={{ p: 2, minWidth: 250 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                        {selectedJob.title}
                      </Typography>
                      <Chip 
                        label={selectedJob.status} 
                        sx={{ textTransform: 'capitalize' }}
                        color={
                          selectedJob.status === 'scheduled' ? 'info' :
                          selectedJob.status === 'in_progress' ? 'warning' :
                          selectedJob.status === 'completed' ? 'success' :
                          'error'
                        }
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {getCustomerForJob(selectedJob)?.name || 'Unknown Customer'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {selectedJob.service?.replace('_', ' ') || 'No service specified'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {selectedJob.location?.address || 'No address specified'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {selectedJob.date}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {selectedJob.time}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          £{selectedJob.price}
                        </Typography>
                      </Box>

                      {selectedJob.recurring && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimerIcon color="action" fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {selectedJob.recurring.frequency === 'custom' 
                              ? `Every ${selectedJob.recurring.interval} weeks` 
                              : selectedJob.recurring.frequency}
                          </Typography>
                        </Box>
                      )}

                      {selectedJob.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>Notes:</strong> {selectedJob.notes}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      <Tooltip title="Edit job">
                        <IconButton onClick={() => onEditJob(selectedJob)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Complete job">
                        <IconButton onClick={() => handleCompleteJob(selectedJob.id)} size="small">
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete job">
                        <IconButton onClick={() => onDeleteJob(selectedJob.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                </Popup>
              )}

              {/* Selected customer popup */}
              {selectedCustomer && (
                <Popup
                  latitude={selectedCustomer.latitude}
                  longitude={selectedCustomer.longitude}
                  anchor="bottom"
                  onClose={() => setSelectedCustomer(null)}
                  closeOnClick={false}
                >
                  <Box sx={{ p: 1, maxWidth: 300 }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedCustomer.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      {selectedCustomer.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">{selectedCustomer.email}</Typography>
                        </Box>
                      )}
                      
                      {selectedCustomer.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">{selectedCustomer.phone}</Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.3 }} />
                        <Box>
                          <Typography variant="body2">{selectedCustomer.address}</Typography>
                          {isCustomerAddressVerified(selectedCustomer) && (
                            <Chip 
                              icon={<VerifiedIcon />} 
                              label="Verified Address" 
                              color="success" 
                              size="small" 
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      {selectedCustomer.notes && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <NoteIcon fontSize="small" sx={{ mr: 1, mt: 0.3 }} />
                          <Typography variant="body2">{selectedCustomer.notes}</Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setNotificationMessage('Edit functionality coming soon');
                          setNotificationOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Popup>
              )}
            </Map>
          </ErrorBoundary>
        )}

        {/* Action buttons */}
        <SpeedDial
          ariaLabel="map actions"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
        >
          <SpeedDialAction
            icon={<WorkIcon />}
            tooltipTitle="New Job"
            onClick={createNewJob}
          />
          <SpeedDialAction
            icon={<ReceiptIcon />}
            tooltipTitle="New Quote"
            onClick={createNewQuote}
          />
          <SpeedDialAction
            icon={<PersonAddIcon />}
            tooltipTitle="Add Customer"
            onClick={handleAddNewCustomer}
          />
        </SpeedDial>
      </Box>

      {/* Rest of the component */}
      <Dialog
        open={isCompletionDialogOpen}
        onClose={() => setIsCompletionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Job</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Add notes about the completion of this job:
          </Typography>
          <TextField
            fullWidth
            label="Completion Notes"
            multiline
            rows={4}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCompletionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmCompletion} variant="contained" color="primary">
            Complete Job
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        message={notificationMessage}
      />

      {/* Add New Customer Dialog */}
      <Dialog
        open={isNewCustomerDialogOpen}
        onClose={handleCloseNewCustomerDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newCustomerData.name}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newCustomerData.email || ''}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phone"
              value={newCustomerData.phone || ''}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
            />
            
            {/* Address Input */}
            <ErrorBoundary name="MapAddressVerification">
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>
                Type an address to search and select from suggestions (required)
              </Typography>
              <Autocomplete
                fullWidth
                freeSolo={false}
                options={addressSuggestions}
                getOptionLabel={(option) => 
                  typeof option === 'string' ? option : option.placeName
                }
                isOptionEqualToValue={(option, value) => 
                  option.id === value.id
                }
                value={selectedAddressSuggestion}
                onChange={(event, newValue) => {
                  if (typeof newValue !== 'string' && newValue) {
                    const [longitude, latitude] = newValue.center;
                    setNewCustomerData({
                      ...newCustomerData,
                      address: newValue.placeName,
                      latitude: latitude,
                      longitude: longitude
                    });
                    
                    setAddressVerificationResult({
                      verified: true,
                      message: `Address verified: ${newValue.placeName}`
                    });
                    
                    setSelectedAddressSuggestion(newValue);
                  }
                }}
                onInputChange={(event, newInputValue, reason) => {
                  // Don't reset verification if just clearing the field
                  if (reason === 'clear') {
                    setNewCustomerData({ ...newCustomerData, address: '' });
                    return;
                  }
                  
                  // For manual typing, clear the verification
                  if (reason === 'input') {
                    setAddressVerificationResult(null);
                    setSelectedAddressSuggestion(null);
                  }
                  
                  setNewCustomerData({ ...newCustomerData, address: newInputValue });
                  if (newInputValue.length >= 2) {
                    debouncedFetchSuggestions(newInputValue);
                  }
                }}
                loading={isLoadingSuggestions}
                loadingText="Searching addresses..."
                noOptionsText={!newCustomerData.address || newCustomerData.address.length < 2 ? "Type at least 2 characters" : "No addresses found"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Address"
                    required
                    multiline
                    sx={{ flex: 1 }}
                    error={Boolean(!addressVerificationResult?.verified && newCustomerData.address && newCustomerData.address.length > 0)}
                    helperText={
                      isLoadingSuggestions 
                        ? "Searching..." 
                        : !addressVerificationResult?.verified && newCustomerData.address && newCustomerData.address.length > 0
                          ? isPostcodeFormat(newCustomerData.address)
                            ? "Type a complete postcode to see addresses in that area"
                            : "Please select an address from the suggestions"
                          : "Enter an address or postcode and select from suggestions"
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <MenuItem {...props} key={option.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">{option.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.placeName}
                      </Typography>
                    </Box>
                  </MenuItem>
                )}
              />
            
              {addressVerificationResult && (
                <Alert 
                  severity={addressVerificationResult.verified ? "success" : "warning"}
                  icon={addressVerificationResult.verified ? <VerifiedIcon /> : <ErrorOutlineIcon />}
                  sx={{ 
                    mb: 2,
                    animation: 'fadeIn 0.5s ease-in-out',
                    '@keyframes fadeIn': {
                      '0%': { opacity: 0, transform: 'translateY(-10px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  {addressVerificationResult.message}
                </Alert>
              )}
            </ErrorBoundary>
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={newCustomerData.notes || ''}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewCustomerDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveNewCustomer} 
            variant="contained" 
            color="primary"
            disabled={!newCustomerData.name || !newCustomerData.address || !addressVerificationResult?.verified}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapOverview; 