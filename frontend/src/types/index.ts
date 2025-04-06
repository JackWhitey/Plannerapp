export interface Job {
  id: string;
  title: string;
  customer: string;
  address: string;
  service: string;
  price: number;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'skipped';
  notes?: string;
  round?: string;
  frequency?: number;
  lastCompleted?: string;
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cleaner' | 'customer';
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

// Component Props Types
export interface DashboardProps {
  jobs: Job[];
  setJobs: (jobs: Job[] | ((prevJobs: Job[]) => Job[])) => void;
}

export interface WorkPlannerProps {
  jobs: Job[];
  onEditJob: (job: Job) => void;
  onCompleteJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateJob: (job: Job) => void;
}

export interface MapOverviewProps {
  jobs: Job[];
}

export interface NotificationContextType {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
} 