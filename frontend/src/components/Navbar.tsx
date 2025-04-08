import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Map', icon: <MapIcon />, path: '/map' },
    { text: 'Work Planner', icon: <CalendarMonthIcon />, path: '/planner' },
    { text: 'Customers', icon: <PersonIcon />, path: '/customers' },
  ];

  const drawer = (
    <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}>
        <CleaningServicesIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          Cleaning Service
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            sx={{
              color: isActive(item.path) ? 'primary.main' : 'text.primary',
              backgroundColor: isActive(item.path) ? 'rgba(76, 154, 255, 0.08)' : 'transparent',
              borderLeft: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              transition: 'all 0.2s ease-in-out',
              pl: isActive(item.path) ? 2 : 3,
              '&:hover': {
                backgroundColor: isActive(item.path) ? 'rgba(76, 154, 255, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                pl: 2,
                borderLeft: `4px solid ${isActive(item.path) ? theme.palette.primary.main : theme.palette.primary.light}`,
              },
            }}
            onClick={handleDrawerToggle}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              transform: isActive(item.path) ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}>
              <Box sx={{ 
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                transition: 'color 0.2s ease'
              }}>
                {item.icon}
              </Box>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 500 : 400
                }} 
              />
            </Box>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>A</Avatar>
        <Typography variant="body2">Admin User</Typography>
      </Box>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(20px)',
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
        >
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 36, 
            height: 36,
            mr: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 0 0 4px rgba(76, 154, 255, 0.2)',
            }
          }}>
            <CleaningServicesIcon fontSize="small" />
          </Avatar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Cleaning Service
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {isMobile ? (
          <>
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ 
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(90deg)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              variant="temporary"
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: 280,
                  boxSizing: 'border-box',
                },
              }}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                color={isActive(item.path) ? 'primary' : 'inherit'}
                startIcon={item.icon}
                variant={isActive(item.path) ? 'contained' : 'text'}
                sx={{
                  borderRadius: '20px',
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.path) 
                      ? 'primary.dark' 
                      : 'rgba(76, 154, 255, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
            <Avatar 
              sx={{ 
                ml: 1,
                cursor: 'pointer',
                width: 36,
                height: 36,
                bgcolor: 'secondary.main',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 0 0 4px rgba(101, 84, 192, 0.2)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              A
            </Avatar>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 