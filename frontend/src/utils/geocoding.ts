import axios from 'axios';

interface Location {
  lat: number;
  lng: number;
}

export const geocodeAddress = async (address: string): Promise<Location> => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json`,
      {
        params: {
          access_token: process.env.REACT_APP_MAPBOX_TOKEN,
          country: 'gb', // Limit to UK
          types: 'address',
        },
      }
    );

    if (response.data.features.length === 0) {
      throw new Error('No results found');
    }

    const [longitude, latitude] = response.data.features[0].center;
    return { lat: latitude, lng: longitude };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
};

export const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
      {
        params: {
          access_token: process.env.REACT_APP_MAPBOX_TOKEN,
          types: 'address',
        },
      }
    );

    if (response.data.features.length === 0) {
      throw new Error('No results found');
    }

    return response.data.features[0].place_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Failed to reverse geocode coordinates');
  }
}; 