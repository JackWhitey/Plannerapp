export const checkEnvVariables = () => {
  console.log('Environment Variables Check:');
  console.log('REACT_APP_MAPBOX_TOKEN:', process.env.REACT_APP_MAPBOX_TOKEN ? 'Exists' : 'Missing');
  return {
    mapboxToken: process.env.REACT_APP_MAPBOX_TOKEN
  };
}; 