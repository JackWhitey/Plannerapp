interface Location {
  lat: number;
  lng: number;
}

export const geocodeAddress = async (address: string): Promise<Location> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
    );
    const data = await response.json();

    if (data.features && data.features[0]) {
      const [lng, lat] = data.features[0].center;
      return {
        lat,
        lng,
      };
    } else {
      throw new Error('Address not found');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}; 