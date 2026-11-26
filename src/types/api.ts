export interface PaginationMeta {
  currentPage: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}