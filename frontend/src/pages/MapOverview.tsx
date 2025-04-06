import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Chip, Drawer } from '@mui/material';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { geocodeAddress } from '../utils/geocoding';
import { checkEnvVariables } from '../utils/envCheck';
import { testMapboxToken } from '../utils/mapboxTest';

// Check environment variables on component mount
checkEnvVariables();

// Set your Mapbox access token here
const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
console.log('Environment check:', {
  token: mapboxToken ? 'Token exists' : 'No token found',
  tokenLength: mapboxToken?.length,
  env: process.env.NODE_ENV
});

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
  location?: {
    lat: number;
    lng: number;
  };
}

interface MapOverviewProps {
  jobs: Job[];
}

// Sample jobs data
const sampleJobs: Job[] = [
  {
    id: '1',
    customer: 'John Smith',
    address: 'Worthing Town Hall, Chapel Road, Worthing, UK',
    service: 'Regular Cleaning',
    price: 45,
    date: '2024-04-10',
    time: '09:00',
    status: 'scheduled',
    notes: 'First floor only',
    round: 'Round 1',
    frequency: 1,
    lastCompleted: null,
    location: {
      lat: 50.8185,
      lng: -0.3758
    }
  },
  {
    id: '2',
    customer: 'Sarah Johnson',
    address: 'Worthing Pier, Marine Parade, Worthing, UK',
    service: 'Deep Cleaning',
    price: 85,
    date: '2024-04-11',
    time: '14:00',
    status: 'scheduled',
    notes: 'Include windows',
    round: 'Round 2',
    frequency: 1,
    lastCompleted: null,
    location: {
      lat: 50.8085,
      lng: -0.3658
    }
  },
  {
    id: '3',
    customer: 'Mike Brown',
    address: 'Worthing Hospital, Lyndhurst Road, Worthing, UK',
    service: 'Regular Cleaning',
    price: 55,
    date: '2024-04-12',
    time: '10:00',
    status: 'completed',
    notes: 'Pet friendly',
    round: 'Round 1',
    frequency: 1,
    lastCompleted: '2024-04-05',
    location: {
      lat: 50.8285,
      lng: -0.3858
    }
  }
];

const MapOverview: React.FC<MapOverviewProps> = ({ jobs = sampleJobs }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsWithLocations, setJobsWithLocations] = useState<Job[]>(jobs);
  const [viewport, setViewport] = useState({
    latitude: 50.8185,
    longitude: -0.3758,
    zoom: 13
  });
  const [mapError, setMapError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

  useEffect(() => {
    console.log('Initial jobs data:', jobs);
    console.log('Initial jobsWithLocations:', jobsWithLocations);
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      try {
        await testMapboxToken();
        setIsTokenValid(true);
        console.log('Mapbox token is valid');
      } catch (error) {
        console.error('Token validation failed:', error);
        setMapError(error instanceof Error ? error.message : 'Invalid Mapbox token');
        setIsTokenValid(false);
      }
    };

    validateToken();
  }, []);

  useEffect(() => {
    const loadJobLocations = async () => {
      console.log('Loading job locations for jobs:', jobs);
      const jobsWithCoords = await Promise.all(
        jobs.map(async (job) => {
          if (!job.location) {
            try {
              console.log('Geocoding address:', job.address);
              const location = await geocodeAddress(job.address);
              console.log('Geocoded location:', location);
              return { ...job, location };
            } catch (error) {
              console.error(`Failed to geocode address for job ${job.id}:`, error);
              return job;
            }
          }
          return job;
        })
      );
      console.log('Jobs with coordinates:', jobsWithCoords);
      setJobsWithLocations(jobsWithCoords);
      
      // Set map center to first job location if available
      const firstJobWithLocation = jobsWithCoords.find(job => job.location);
      if (firstJobWithLocation?.location) {
        console.log('Setting viewport to first job location:', firstJobWithLocation.location);
        setViewport({
          latitude: firstJobWithLocation.location.lat,
          longitude: firstJobWithLocation.location.lng,
          zoom: 13
        });
      }
    };

    loadJobLocations();
  }, [jobs]);

  useEffect(() => {
    console.log('Jobs with locations:', jobsWithLocations);
    console.log('Viewport:', viewport);
  }, [jobsWithLocations, viewport]);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Job Locations
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper elevation={3} sx={{ p: 2, flex: 1, position: 'relative' }}>
          {mapError && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                zIndex: 1,
              }}
            >
              <Typography color="error">{mapError}</Typography>
            </Box>
          )}
          {!isTokenValid ? (
            <Box
              sx={{
                width: '100%',
                height: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Typography>Loading map...</Typography>
            </Box>
          ) : (
            <Map
              mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
              {...viewport}
              onMove={evt => setViewport(evt.viewState)}
              style={{ width: '100%', height: 600 }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              onError={(e) => {
                console.error('Map error:', e);
                setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
              }}
            >
              <NavigationControl position="top-right" />
              
              {console.log('Rendering markers for jobs:', jobsWithLocations)}
              {jobsWithLocations.map((job) => {
                if (!job.location) {
                  console.log('Job without location:', job);
                  return null;
                }
                
                console.log('Rendering marker for job:', job);
                return (
                  <Marker
                    key={job.id}
                    latitude={job.location.lat}
                    longitude={job.location.lng}
                    onClick={() => setSelectedJob(job)}
                    style={{
                      cursor: 'pointer',
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: job.status === 'completed' ? '#4caf50' : '#1976d2',
                        borderRadius: '50%',
                        border: '3px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      £{job.price}
                    </div>
                  </Marker>
                );
              })}

              {selectedJob?.location && (
                <Popup
                  latitude={selectedJob.location.lat}
                  longitude={selectedJob.location.lng}
                  onClose={() => setSelectedJob(null)}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="top"
                  offset={25}
                >
                  <div style={{ padding: '10px', minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{selectedJob.customer}</h3>
                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{selectedJob.service}</p>
                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{selectedJob.time} - {selectedJob.date}</p>
                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{selectedJob.address}</p>
                    <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                      <span style={{ background: '#e0e0e0', padding: '2px 5px', borderRadius: '3px' }}>
                        {selectedJob.round}
                      </span>
                      <span style={{ background: '#bbdefb', padding: '2px 5px', borderRadius: '3px' }}>
                        £{selectedJob.price}
                      </span>
                    </div>
                  </div>
                </Popup>
              )}
            </Map>
          )}
        </Paper>
        
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
              position: 'relative',
              height: 'auto',
              maxHeight: '600px',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            {selectedJob ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedJob.customer}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedJob.service}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedJob.time} - {selectedJob.date}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedJob.address}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={selectedJob.round}
                    color="secondary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`£${selectedJob.price}`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Select a job marker to view details
              </Typography>
            )}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default MapOverview; 