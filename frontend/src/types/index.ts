export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  notes?: string;
  latitude: number;
  longitude: number;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  interval?: number; // For custom frequencies (e.g., every 6 weeks)
  preferredDay?: string; // Preferred day of the week
  preferredTime?: string; // Preferred time of day
  round?: string; // e.g., "Worthing round", "Brighton round"
  lastServiceDate?: string;
  nextServiceDate?: string;
}

export interface Job {
  id: string;
  customerId: string;
  roundId?: string;
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'skipped' | 'in_progress';
  recurrence?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  price?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  date?: string; // Date in YYYY-MM-DD format
  time?: string; // Time in HH:MM format
  service?: 'window_cleaning' | 'gutter_cleaning' | 'pressure_washing' | 'other';
  location?: {
    address: string;
    latitude: number;
    longitude: number;
    round?: string;
  };
  recurring?: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
    interval: number;
  };
  completionNotes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cleaner' | 'customer';
  preferences?: {
    defaultRound?: string;
    defaultServices?: string[];
    notificationPreferences?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface Round {
  id: string;
  name: string;
  description?: string;
  color?: string;
  dayOfWeek?: number; // 0-6 where 0 is Sunday
  createdAt: string;
  updatedAt: string;
  area?: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius?: number;
  };
  customers?: string[]; // Array of customer IDs
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddressSuggestion {
  id: string;
  text: string;
  highlight?: string;
  description?: string;
  context?: string;
  center?: [number, number]; // [longitude, latitude]
  place_name?: string;
  place_type?: string[];
  postcode?: string;
  placeName?: string; // Added for compatibility with some components
}

export interface VerifiedAddress {
  verified: boolean;
  message: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// Component Props Types
export interface DashboardProps {
  jobs: Job[];
  customers: Customer[];
  rounds: Round[];
  onEditJob: (job: Job) => Promise<Job>;
  onCompleteJob: (jobId: string, notes?: string) => Promise<Job>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onUpdateJob: (job: Job) => Promise<Job>;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  onUpdateCustomer: (customer: Customer) => Promise<Customer>;
  isLoading: boolean;
  error: string | null;
}

export interface WorkPlannerProps {
  jobs: Job[];
  customers: Customer[];
  rounds: Round[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEditJob: (job: Job) => Promise<Job>;
  onCompleteJob: (jobId: string, notes?: string) => Promise<Job>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onUpdateJob: (job: Job) => Promise<Job>;
  onGenerateRecurringJobs: (startDate: Date, endDate: Date) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface MapOverviewProps {
  jobs: Job[];
  customers: Customer[];
  rounds: Round[];
  selectedDate?: Date;
  selectedRound?: string;
  onEditJob: (job: Job) => Promise<Job>;
  onCompleteJob: (jobId: string, notes?: string) => Promise<Job>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onUpdateJob: (job: Job) => Promise<Job>;
  onSelectRound: (roundId: string) => void;
  onAddCustomerLocation: (location: { lat: number; lng: number }) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  onUpdateCustomer: (customer: Customer) => Promise<Customer>;
  onDeleteCustomer: (customerId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  onUpdateCustomer: (customer: Customer) => Promise<Customer>;
  onDeleteCustomer: (customerId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationContextType {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
} 