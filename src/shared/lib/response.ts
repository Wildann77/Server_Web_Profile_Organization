import { ApiResponse } from '../types/response';

export const createSuccessResponse = <T>(
  data: T,
  message = 'Success',
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (
  message: string,
  code: string,
  details?: Record<string, string[]>
): ApiResponse => ({
  success: false,
  message,
  error: { code, details },
  timestamp: new Date().toISOString(),
});
