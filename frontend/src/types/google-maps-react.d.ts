declare module '@react-google-maps/api' {
  import { Component, ReactNode } from 'react';

  export interface GoogleMapProps {
    mapContainerStyle?: React.CSSProperties;
    center?: {
      lat: number;
      lng: number;
    };
    zoom?: number;
    options?: {
      [key: string]: any;
    };
    children?: ReactNode;
  }

  export interface MarkerProps {
    position: {
      lat: number;
      lng: number;
    };
    title?: string;
    onClick?: () => void;
  }

  export interface LoadScriptProps {
    googleMapsApiKey: string;
    children: ReactNode;
  }

  export class GoogleMap extends Component<GoogleMapProps> {}
  export class Marker extends Component<MarkerProps> {}
  export class LoadScript extends Component<LoadScriptProps> {}
} 