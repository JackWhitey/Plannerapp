interface Config {
  api: {
    baseUrl: string;
    timeout: number;
  };
  mapbox: {
    token: string;
    style: string;
    defaultZoom: number;
    defaultCenter: {
      lat: number;
      lng: number;
    };
  };
  features: {
    enableNotifications: boolean;
    enableGeocoding: boolean;
    enableOfflineMode: boolean;
  };
}

const config: Config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  mapbox: {
    token: process.env.REACT_APP_MAPBOX_TOKEN || '',
    style: 'mapbox://styles/mapbox/streets-v12',
    defaultZoom: 13,
    defaultCenter: {
      lat: 51.5154,
      lng: -0.1419,
    },
  },
  features: {
    enableNotifications: true,
    enableGeocoding: true,
    enableOfflineMode: false,
  },
};

export default config; 