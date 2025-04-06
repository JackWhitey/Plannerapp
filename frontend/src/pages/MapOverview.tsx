import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { Box, Typography, Paper } from '@mui/material';
import { Job } from '../types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapOverviewProps {
  jobs: Job[];
}

const MapOverview: React.FC<MapOverviewProps> = ({ jobs }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewport, setViewport] = useState({
    latitude: 51.5074,
    longitude: -0.1278,
    zoom: 10
  });

  return (
    <Box sx={{ height: '100vh', width: '100%' }}>
      <Map
        {...viewport}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        {jobs.map(job => (
          <Marker
            key={job.id}
            latitude={job.latitude}
            longitude={job.longitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedJob(job);
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                backgroundColor: 'primary.main',
                border: '2px solid white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s'
                }
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                £{job.price}
              </Typography>
            </Box>
          </Marker>
        ))}

        {selectedJob && (
          <Popup
            latitude={selectedJob.latitude}
            longitude={selectedJob.longitude}
            onClose={() => setSelectedJob(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
          >
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedJob.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedJob.customer}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedJob.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedJob.date} at {selectedJob.time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {selectedJob.status}
              </Typography>
            </Paper>
          </Popup>
        )}
      </Map>
    </Box>
  );
};

export default MapOverview; 