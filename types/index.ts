export interface User {
  id: string;
  email: string;
  name: string;
  faceImageUrl?: string;
  blinkSequence?: Blob;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  checkInTime: Date;
  status: 'success' | 'failed';
  verificationMethod: 'face' | 'blink' | 'both';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
