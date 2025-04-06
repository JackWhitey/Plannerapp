import mapboxgl from 'mapbox-gl';

export const testMapboxToken = async () => {
  const token = process.env.REACT_APP_MAPBOX_TOKEN;
  console.log('Testing Mapbox token:', {
    token: token ? 'Token exists' : 'No token found',
    tokenLength: token?.length,
    env: process.env.NODE_ENV
  });

  if (!token) {
    throw new Error('Mapbox token is missing');
  }

  try {
    // Test the token by making a simple request to Mapbox
    const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${token}`);
    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
    }
    console.log('Mapbox token is valid');
    return true;
  } catch (error) {
    console.error('Mapbox token validation error:', error);
    throw error;
  }
}; 