export interface UserLogin {
  id: number;
  userId: number;
  ipAddress: string;
  userAgent: string;
  device: string; // Device type (mobile, desktop, tablet)
  browser: string; // Browser name and version
  os: string; // Operating system
  country?: string; // Country from IP geolocation
  city?: string; // City from IP geolocation
  loginTime: Date;
  logoutTime?: Date; // When user logged out (null if still active)
  isActive: boolean; // Whether session is currently active
}
