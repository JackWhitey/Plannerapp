interface Config {
  apiUrl: string;
  mapbox: {
    token: string;
  };
  loqate: {
    apiKey: string;
  };
  features: {
    maps: boolean;
    notifications: boolean;
  };
}

const config: Config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  mapbox: {
    token: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || 'pk.your_mapbox_token',
  },
  loqate: {
    apiKey: process.env.REACT_APP_LOQATE_API_KEY || 'your_loqate_api_key',
  },
  features: {
    maps: process.env.REACT_APP_ENABLE_MAPS !== 'false',
    notifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
  },
};

export default config; 