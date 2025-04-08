import { useCallback, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { NotificationContextType } from '../types';

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  const { showNotification } = context as NotificationContextType;

  return {
    showNotification: useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      showNotification(message, severity);
    }, [showNotification])
  };
}; 