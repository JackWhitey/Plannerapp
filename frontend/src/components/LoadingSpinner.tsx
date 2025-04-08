import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Fade, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  timeout?: number; // Time in ms before showing the spinner
}

// Create a pulsing animation
const pulseAnimation = keyframes`
  0% {
    opacity: 0.6;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.98);
  }
`;

// Create a floating animation for the message
const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const AnimatedMessage = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
  animation: `${floatAnimation} 3s ease-in-out infinite`,
  position: 'relative',
}));

const SpinnerWrapper = styled(Box)(({ theme }) => ({
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  fullScreen = false,
  timeout = 500
}) => {
  const [visible, setVisible] = useState(false);

  // Add a small delay before showing the spinner to avoid flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: fullScreen ? 'auto' : '200px',
          ...(fullScreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
          }),
        }}
      >
        <SpinnerWrapper>
          <StyledProgress size={48} thickness={4} />
        </SpinnerWrapper>
        {message && (
          <AnimatedMessage variant="body1">
            {message}
          </AnimatedMessage>
        )}
      </Box>
    </Fade>
  );
};

export default LoadingSpinner; 