import React, { createContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { NotificationContextType } from '../types';

export const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const handleClose = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}; 