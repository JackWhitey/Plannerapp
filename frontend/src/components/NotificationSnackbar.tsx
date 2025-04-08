import React from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps, Box, Typography, IconButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationSnackbarProps {
  message: string;
  severity: AlertColor;
  open: boolean;
  onClose: () => void;
}

type TransitionProps = Omit<SlideProps, 'direction'>;

function SlideTransition(props: TransitionProps) {
  return <Slide {...props} direction="up" />;
}

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(1, 2),
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 
    severity === 'success' ? 'rgba(54, 179, 126, 0.95)' :
    severity === 'error' ? 'rgba(255, 86, 48, 0.95)' :
    severity === 'warning' ? 'rgba(255, 171, 0, 0.95)' :
    'rgba(76, 154, 255, 0.95)',
  color: '#ffffff',
  backdropFilter: 'blur(8px)',
  border: 'none',
  '& .MuiAlert-icon': {
    display: 'none',
  },
  '& .MuiAlert-message': {
    padding: 0,
  },
  '& .MuiAlert-action': {
    padding: 0,
    marginRight: -theme.spacing(1),
  },
  transform: 'translateY(0)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  message,
  severity,
  open,
  onClose,
}) => {
  const theme = useTheme();
  
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" />;
      case 'info':
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      sx={{ 
        mb: 3,
        '& .MuiSnackbar-root': {
          transition: 'all 0.3s ease',
        },
      }}
    >
      <StyledAlert 
        severity={severity}
        onClose={onClose}
        icon={false}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
            sx={{ 
              opacity: 0.7, 
              transition: 'all 0.2s ease',
              '&:hover': { 
                opacity: 1,
                transform: 'rotate(90deg)',
              } 
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { opacity: 0.7 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.7 },
              },
            }}
          >
            {getIcon()}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
        </Box>
      </StyledAlert>
    </Snackbar>
  );
};

export default NotificationSnackbar; 