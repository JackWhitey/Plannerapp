import axios from 'axios';
import config from '../config';

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
          access_token: config.mapbox.token,
          country: 'gb', // Limit to UK
          types: 'address',
          fuzzyMatch: true,
          language: 'en',
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
          access_token: config.mapbox.token,
          types: 'address',
          language: 'en',
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

export interface VerifiedAddress {
  originalAddress: string;
  formattedAddress: string;
  location: Location;
  confidence: number;
  isVerified: boolean;
}

export const verifyAddress = async (address: string): Promise<VerifiedAddress> => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json`,
      {
        params: {
          access_token: config.mapbox.token,
          country: 'gb', // Limit to UK
          types: 'address',
          limit: 1,
          language: 'en',
          fuzzyMatch: true,
        },
      }
    );

    if (response.data.features.length === 0) {
      return {
        originalAddress: address,
        formattedAddress: '',
        location: { lat: 0, lng: 0 },
        confidence: 0,
        isVerified: false,
      };
    }

    const feature = response.data.features[0];
    const [longitude, latitude] = feature.center;
    
    return {
      originalAddress: address,
      formattedAddress: feature.place_name,
      location: { lat: latitude, lng: longitude },
      confidence: feature.relevance,
      isVerified: feature.relevance > 0.8, // Consider addresses with relevance > 0.8 as verified
    };
  } catch (error) {
    console.error('Address verification error:', error);
    // Return a failed verification object instead of throwing
    return {
      originalAddress: address,
      formattedAddress: '',
      location: { lat: 0, lng: 0 },
      confidence: 0,
      isVerified: false,
    };
  }
};

export interface AddressSuggestion {
  id: string;
  text: string;
  placeName: string;
  center: [number, number]; // [longitude, latitude]
  relevance: number;
  placeType?: string;
  context?: any[];
}

// Improved function to get address suggestions as user types
export const getAddressSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
  if (!query || query.length < 2) return []; // Only search if query is at least 2 characters
  
  try {
    console.log('Fetching address suggestions for:', query);
    
    // UK Postcode regex pattern (basic pattern)
    const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    const isPostcode = postcodePattern.test(query);
    
    // Use different parameters based on whether it's a postcode search or regular address search
    const params = {
      access_token: config.mapbox.token,
      country: 'gb',
      autocomplete: true,
      fuzzyMatch: true,
      language: 'en',
      limit: isPostcode ? 10 : 6, // Increased limit for postcodes to get more addresses
    };
    
    if (isPostcode) {
      // For postcodes, we specifically focus on getting addresses
      Object.assign(params, {
        types: 'address,postcode',
        proximity: 'ip', // Bias towards user's location
      });
    } else {
      // For regular searches
      Object.assign(params, {
        types: 'address,postcode,place,locality,neighborhood',
      });
    }
    
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      { params }
    );

    if (!response.data.features || response.data.features.length === 0) {
      console.log('No address suggestions found for query:', query);
      return [];
    }

    // For postcodes, we want to show both the postcode result and all addresses within that postcode
    let suggestions = response.data.features.map((feature: any) => ({
      id: feature.id,
      text: feature.text,
      placeName: feature.place_name,
      center: feature.center,
      relevance: feature.relevance,
    }));
    
    // If it's a postcode search and we got the postcode itself as a result, but not many addresses
    // we might need to do a secondary search for addresses in that area
    if (isPostcode && suggestions.length <= 2 && suggestions.some((s: AddressSuggestion) => s.text.toUpperCase() === query.toUpperCase())) {
      try {
        // Extract coordinates from the postcode result to use as the center for the second search
        const postcodeSuggestion = suggestions.find((s: AddressSuggestion) => s.text.toUpperCase() === query.toUpperCase());
        if (postcodeSuggestion) {
          const [longitude, latitude] = postcodeSuggestion.center;
          
          // Now do a secondary search by location to find more addresses in that area
          console.log(`Doing secondary search for addresses near postcode ${query} at ${latitude},${longitude}`);
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${longitude},${latitude}&types=address&country=gb&access_token=${config.mapbox.token}`
          );
          
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            // Convert the results to our suggestion format
            const addressSuggestions = data.features.map((feature: any): AddressSuggestion => ({
              id: feature.id,
              text: feature.text,
              center: feature.center,
              placeName: feature.place_name,
              relevance: feature.relevance || 1,
              placeType: feature.place_type?.[0],
              context: feature.context
            }));
            
            // Combine original and address results, putting the original postcode first
            suggestions = [
              ...suggestions.filter((s: AddressSuggestion) => s.text.toUpperCase() === query.toUpperCase()),
              ...addressSuggestions
            ];
          }
        }
      } catch (error) {
        console.error('Error during secondary address search:', error);
      }
    }
    
    console.log('Found address suggestions:', suggestions.length);
    return suggestions;
  } catch (error) {
    console.error('Address suggestion error:', error);
    // Log the detailed error for debugging
    if (axios.isAxiosError(error) && error.response) {
      console.error('Mapbox API error response:', error.response.data);
    }
    return [];
  }
}; 