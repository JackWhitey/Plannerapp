import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  ButtonGroup,
  DialogContentText,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NoteIcon from '@mui/icons-material/Note';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Customer } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { verifyAddress, getAddressSuggestions, AddressSuggestion } from '../utils/geocoding';
import { debounce } from 'lodash';
import config from '../config';

// Simple interface for verification result notification
interface VerificationResult {
  verified: boolean;
  message: string;
}

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  onUpdateCustomer: (customer: Customer) => Promise<Customer>;
  onDeleteCustomer?: (customerId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Add this helper function to detect postcodes
const isPostcodeFormat = (text: string): boolean => {
  const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  const partialPostcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i;
  return postcodePattern.test(text) || partialPostcodePattern.test(text);
};

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [selectedAddressSuggestion, setSelectedAddressSuggestion] = useState<AddressSuggestion | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const initialCustomerState: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    latitude: 0,
    longitude: 0,
  };

  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>(initialCustomerState);

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
    debounce((query: string) => {
      fetchAddressSuggestions(query);
    }, 300),
    [fetchAddressSuggestions]
  );

  useEffect(() => {
    if (addressInput.length >= 2) {
      debouncedFetchSuggestions(addressInput);
    } else {
      setAddressSuggestions([]);
    }
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [addressInput, debouncedFetchSuggestions]);

  const handleAddClick = () => {
    setEditingCustomer(null);
    setNewCustomer(initialCustomerState);
    setVerificationResult(null);
    setAddressInput('');
    setAddressSuggestions([]);
    setIsDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setVerificationResult(null);
    setAddressInput(customer.address);
    setAddressSuggestions([]);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete && onDeleteCustomer) {
      try {
        await onDeleteCustomer(customerToDelete.id);
        setNotificationMessage(`Customer "${customerToDelete.name}" has been deleted`);
        setNotificationOpen(true);
      } catch (err) {
        console.error('Error deleting customer:', err);
        setNotificationMessage('Error deleting customer');
        setNotificationOpen(true);
      }
    }
    setIsDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setNewCustomer(initialCustomerState);
    setVerificationResult(null);
  };

  const handleSave = async () => {
    try {
      if (!verificationResult?.verified) {
        setNotificationMessage('Please select a verified address from the suggestions');
        setNotificationOpen(true);
        return;
      }
      
      if (editingCustomer) {
        await onUpdateCustomer(editingCustomer);
        setNotificationMessage('Customer updated successfully');
      } else {
        await onAddCustomer(newCustomer);
        setNotificationMessage('Customer added successfully');
      }
      setNotificationOpen(true);
      handleDialogClose();
    } catch (err) {
      console.error('Error saving customer:', err);
      setNotificationMessage('Error saving customer');
      setNotificationOpen(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingCustomer) {
      setEditingCustomer({ ...editingCustomer, [name]: value });
    } else {
      setNewCustomer({ ...newCustomer, [name]: value });
    }

    if (name === 'address') {
      setAddressInput(value);
    }
  };

  const handleAddressSuggestionSelect = async (suggestion: AddressSuggestion | null) => {
    if (!suggestion) return;
    
    setIsLoadingSuggestions(true);
    try {
      // Extract location from the suggestion
      const [longitude, latitude] = suggestion.center;
      
      // Update form data with the verified address
      if (editingCustomer) {
        setEditingCustomer({
          ...editingCustomer,
          address: suggestion.placeName,
          latitude,
          longitude,
        });
      } else {
        setNewCustomer({
          ...newCustomer,
          address: suggestion.placeName,
          latitude,
          longitude,
        });
      }
      
      // Set verification result to show success message
      setVerificationResult({
        verified: true,
        message: `Address verified: ${suggestion.placeName}`,
      });
      
      setAddressInput(suggestion.placeName);
      setSelectedAddressSuggestion(suggestion);
    } catch (error) {
      console.error('Error selecting address suggestion:', error);
      setVerificationResult({
        verified: false,
        message: 'Unable to verify this address. Please check and try again.',
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, 
          flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0 }}>
          <Typography variant="h4" component="h1">
            Customer Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            fullWidth={isMobile}
          >
            Add Customer
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Search Customers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{ backgroundColor: 'background.paper' }}
          />
        </Box>

        {filteredCustomers.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No customers found
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{ mt: 2 }}
            >
              Add Your First Customer
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredCustomers.map(customer => (
              <Grid item xs={12} sm={6} md={4} key={customer.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {customer.name}
                    </Typography>
                    <List dense>
                      {customer.email && (
                        <ListItem disablePadding>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <EmailIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={customer.email} />
                        </ListItem>
                      )}
                      {customer.phone && (
                        <ListItem disablePadding>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <PhoneIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={customer.phone} />
                        </ListItem>
                      )}
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LocationOnIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={customer.address} />
                      </ListItem>
                      {customer.notes && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <NoteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Notes"
                              secondary={customer.notes}
                              secondaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        </>
                      )}
                    </List>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <ButtonGroup size="small">
                      <Tooltip title="Edit customer">
                        <IconButton onClick={() => handleEditClick(customer)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {onDeleteCustomer && (
                        <Tooltip title="Delete customer">
                          <IconButton 
                            onClick={() => handleDeleteClick(customer)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ButtonGroup>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                name="name"
                value={editingCustomer?.name || newCustomer.name}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={editingCustomer?.email || newCustomer.email}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Phone"
                name="phone"
                value={editingCustomer?.phone || newCustomer.phone}
                onChange={handleChange}
                fullWidth
              />
              
              <ErrorBoundary name="AddressVerification">
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>
                  Type an address to search and select from suggestions (required)
                </Typography>
                <Autocomplete
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
                    handleAddressSuggestionSelect(
                      typeof newValue === 'string' 
                        ? null 
                        : newValue
                    );
                  }}
                  onInputChange={(event, newInputValue, reason) => {
                    // Don't reset verification if just clearing the field
                    if (reason === 'clear') {
                      setAddressInput('');
                      return;
                    }
                    
                    // For manual typing, clear the verification
                    if (reason === 'input') {
                      setVerificationResult(null);
                      setSelectedAddressSuggestion(null);
                    }
                    
                    setAddressInput(newInputValue);
                    if (editingCustomer) {
                      setEditingCustomer({ ...editingCustomer, address: newInputValue });
                    } else {
                      setNewCustomer({ ...newCustomer, address: newInputValue });
                    }
                  }}
                  loading={isLoadingSuggestions}
                  loadingText="Searching addresses..."
                  noOptionsText={addressInput.length < 2 ? "Type at least 2 characters" : "No addresses found"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="address"
                      label="Address"
                      required
                      fullWidth
                      error={!verificationResult?.verified && addressInput.length > 0}
                      helperText={
                        isLoadingSuggestions 
                          ? "Searching..." 
                          : !verificationResult?.verified && addressInput.length > 0
                            ? isPostcodeFormat(addressInput)
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
                
                {verificationResult && (
                  <Alert 
                    severity={verificationResult.verified ? "success" : "warning"}
                    icon={verificationResult.verified ? <VerifiedIcon /> : <ErrorOutlineIcon />}
                    sx={{ 
                      mb: 2,
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(-10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    {verificationResult.message}
                  </Alert>
                )}
              </ErrorBoundary>
              
              <TextField
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={editingCustomer?.notes || newCustomer.notes}
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary"
              disabled={
                !(editingCustomer?.name || newCustomer.name) || 
                !(editingCustomer?.address || newCustomer.address) ||
                !verificationResult?.verified
              }
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isDeleteDialogOpen}
          onClose={handleCancelDelete}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete customer "{customerToDelete?.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notificationOpen}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          message={notificationMessage}
        />
      </Box>
    </ErrorBoundary>
  );
};

export default CustomerManagement; 