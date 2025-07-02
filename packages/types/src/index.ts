// Export all express-related types
export * from './express.js';

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
  };
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    requestId?: string;
    timestamp: string;
  };
}

// Base entity interface
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}
