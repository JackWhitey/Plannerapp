import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cleaning Service App
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/map"
          >
            Map
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/planner"
          >
            Work Planner
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 