import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Alert,
  MenuItem,
  FormControl,
} from '@mui/material';
// Comment out react-leaflet imports until it's properly installed
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getAddressSuggestions, AddressSuggestion } from '../utils/geocoding';
import { debounce } from 'lodash';

interface VerificationResult {
  verified: boolean;
  message: string;
}

const ServiceBooking = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    serviceType: 'regular_cleaning',
    date: '',
    time: '',
    notes: '',
    latitude: 0,
    longitude: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressVerificationResult, setAddressVerificationResult] = useState<VerificationResult | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedAddressSuggestion, setSelectedAddressSuggestion] = useState<AddressSuggestion | null>(null);

  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getAddressSuggestions(query);
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const debouncedFetchSuggestions = React.useCallback(
    debounce((query: string) => {
      fetchAddressSuggestions(query);
    }, 300),
    []
  );

  // Check for a valid UK postcode format
  const isPostcodeFormat = (input: string): boolean => {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(input.trim());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book a Service
      </Typography>

      {/* Address section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Service Address
        </Typography>
        
        <FormControl fullWidth error={Boolean(errors.address)} required>
          <Autocomplete
            freeSolo={false}
            options={addressSuggestions}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : option.text
            }
            isOptionEqualToValue={(option, value) => {
              if (typeof option === 'string' || typeof value === 'string') {
                return false;
              }
              return option.id === value.id;
            }}
            value={selectedAddressSuggestion}
            onChange={(event, newValue) => {
              if (typeof newValue !== 'string' && newValue) {
                const [longitude, latitude] = newValue.center;
                setFormData({
                  ...formData,
                  address: newValue.placeName,
                  latitude: latitude,
                  longitude: longitude
                });
                setSelectedAddressSuggestion(newValue);
                setAddressVerificationResult({
                  verified: true,
                  message: `Address verified: ${newValue.placeName}`
                });
              }
            }}
            onInputChange={(event, newInputValue: string, reason) => {
              if (reason === 'clear') {
                setFormData({ ...formData, address: '' });
                return;
              }
              
              if (reason === 'input') {
                setAddressVerificationResult(null);
                setSelectedAddressSuggestion(null);
              }
              
              setFormData({ ...formData, address: newInputValue });
              if (newInputValue.length >= 2) {
                debouncedFetchSuggestions(newInputValue);
              }
            }}
            loading={isLoadingSuggestions}
            loadingText="Searching addresses..."
            noOptionsText={!formData.address || formData.address.length < 2 ? "Type at least 2 characters" : "No addresses found"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Service Address"
                required
                error={Boolean(errors.address)}
                helperText={
                  errors.address ? errors.address : 
                  isLoadingSuggestions ? "Searching..." : 
                  "Enter a UK address or postcode and select from suggestions"
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
            renderOption={(props, option) => {
              if (typeof option === 'string') {
                return <MenuItem {...props}>{option}</MenuItem>;
              }
              
              return (
                <MenuItem {...props} key={option.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">{option.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.placeName}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            }}
          />
        </FormControl>
        
        {addressVerificationResult && (
          <Alert 
            severity={addressVerificationResult.verified ? "success" : "warning"}
            icon={addressVerificationResult.verified ? <VerifiedIcon /> : <ErrorOutlineIcon />}
            sx={{ mt: 2 }}
          >
            {addressVerificationResult.message}
          </Alert>
        )}
        
        {/* Comment out map until react-leaflet is properly installed */}
        {/* {formData.latitude && formData.longitude && (
          <Box sx={{ mt: 2, height: 200, borderRadius: 1, overflow: 'hidden' }}>
            <MapContainer 
              center={[formData.latitude, formData.longitude]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[formData.latitude, formData.longitude]}>
                <Popup>Service location</Popup>
              </Marker>
            </MapContainer>
          </Box>
        )} */}
      </Paper>

      {/* Rest of the form would go here */}
    </Box>
  );
};

export default ServiceBooking; 