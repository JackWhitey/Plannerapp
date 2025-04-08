import axios from 'axios';
import config from '../config';

/**
 * Loqate API Test Utility
 * 
 * This utility helps test the Loqate API integration.
 * It can be used in the browser console to verify API connectivity.
 */

/**
 * Tests the Loqate API by searching for an address
 * @param query The address or postcode to search for
 * @returns Promise with the search results
 */
export async function testLoqateSearch(query: string) {
  console.log('Testing Loqate search with query:', query);
  
  // Check if config.loqate exists before using it
  if (!config || !(config as any).loqate || !(config as any).loqate.apiKey) {
    console.error('Loqate API key is not configured');
    return { error: 'Loqate API key is not configured' };
  }
  
  const apiKey = (config as any).loqate.apiKey;
  console.log('Using API key:', apiKey.substring(0, 4) + '...');
  
  try {
    const response = await axios.get('https://api.addressy.com/Capture/Interactive/Find/v1.10/json3.ws', {
      params: {
        Key: apiKey,
        Text: query,
        IsMiddleware: false,
        Countries: 'GB',
        Limit: 10,
        Language: 'en-gb'
      }
    });
    
    console.log('Loqate API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Loqate API error:', error);
    throw error;
  }
}

/**
 * Tests the Loqate API by retrieving address details
 * @param id The Loqate ID from a search result
 * @returns Promise with the address details
 */
export async function testLoqateRetrieve(id: string) {
  console.log('Testing Loqate retrieve with ID:', id);
  
  // Check if config.loqate exists before using it
  if (!config || !(config as any).loqate || !(config as any).loqate.apiKey) {
    console.error('Loqate API key is not configured');
    return { error: 'Loqate API key is not configured' };
  }
  
  const apiKey = (config as any).loqate.apiKey;
  
  try {
    const response = await axios.get('https://api.addressy.com/Capture/Interactive/Retrieve/v1.10/json3.ws', {
      params: {
        Key: apiKey,
        Id: id
      }
    });
    
    console.log('Loqate API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Loqate API error:', error);
    throw error;
  }
}

/**
 * Tests a full Loqate address search and retrieval flow
 * @param query The address or postcode to search for
 * @returns Promise with the final address details
 */
export async function testFullLoqateFlow(query: string) {
  console.log('Testing full Loqate flow with query:', query);
  
  try {
    // Step 1: Search for an address
    const searchResults = await testLoqateSearch(query);
    
    if (!searchResults.Items || searchResults.Items.length === 0) {
      console.log('No results found');
      return null;
    }
    
    // Step 2: Get the first result ID
    const firstResult = searchResults.Items[0];
    console.log('Selected result:', firstResult);
    
    if (firstResult.Type !== 'Address') {
      console.log('Result is not a final address, retrieving details...');
      
      // Step 3: Retrieve address details
      const addressDetails = await testLoqateRetrieve(firstResult.Id);
      console.log('Final address details:', addressDetails);
      return addressDetails;
    } else {
      console.log('Result is a final address');
      return firstResult;
    }
  } catch (error) {
    console.error('Full Loqate flow error:', error);
    throw error;
  }
}

// Export a utility object that can be used in the browser console
const LoqateTester = {
  search: testLoqateSearch,
  retrieve: testLoqateRetrieve,
  fullFlow: testFullLoqateFlow,
  
  // Usage examples
  examples: {
    searchPostcode: () => testLoqateSearch('SW1A 1AA'),
    searchAddress: () => testLoqateSearch('10 Downing Street, London'),
    fullFlow: () => testFullLoqateFlow('SW1A 1AA')
  }
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).LoqateTester = LoqateTester;
}

export default LoqateTester; 