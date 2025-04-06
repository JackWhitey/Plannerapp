import { useState, useEffect } from 'react';
import { MapViewport } from '../types';
import { geocodeAddress } from '../utils/geocoding';

export const useMap = (initialViewport: MapViewport) => {
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewportChange = (newViewport: MapViewport) => {
    setViewport(newViewport);
  };

  const geocodeJobLocation = async (address: string) => {
    setLoading(true);
    setError(null);
    try {
      const location = await geocodeAddress(address);
      return location;
    } catch (err) {
      setError('Failed to geocode address');
      console.error('Geocoding error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const centerOnLocation = (lat: number, lng: number) => {
    setViewport(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  useEffect(() => {
    // Log viewport changes for debugging
    console.log('Viewport updated:', viewport);
  }, [viewport]);

  return {
    viewport,
    loading,
    error,
    handleViewportChange,
    geocodeJobLocation,
    centerOnLocation,
  };
}; 