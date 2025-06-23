// lib/apiClient.ts - Comprehensive API client implementation
interface ApiResponse<T> {
  status: string;
  data: T;
  error?: string;
}

interface ApiConfig {
  baseURL: string;
  timeout: number;
  credentials: RequestCredentials;
  headers: Record<string, string>;
}

class ApiClient {
  private config: ApiConfig;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.config = {
      baseURL: this.getBaseURL(),
      timeout: 30000,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    // Add development-specific headers
    if (process.env.NODE_ENV === 'development') {
      this.config.headers['X-Development-Mode'] = 'true';
      this.config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }
  }

  private getBaseURL(): string {
    // Priority order: explicit API URL, backend URL, default
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'https://inventory.jabnet.id'
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      credentials: this.config.credentials,
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Authentication required');
        }
        if (response.status === 403) {
          throw new AuthorizationError('Access denied');
        }
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }

      // Retry logic for network errors
      if (retryCount < this.retryAttempts && this.isRetryableError(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.request(endpoint, options, retryCount + 1);
      }

      console.error(`API request failed for ${endpoint}:`, error);
      throw new ApiError(`Request failed: ${error.message}`);
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      (error.message && error.message.includes('network'))
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }) {
    return this.request('/api/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/user/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/user/me', {
      method: 'GET',
    });
  }

  // Records methods with proper error handling
  async getRecords(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/records${queryString}`, {
      method: 'GET',
    });
  }

  async createRecord(data: any) {
    return this.request('/api/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(id: string, data: any) {
    return this.request(`/api/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(id: string) {
    return this.request(`/api/records/${id}`, {
      method: 'DELETE',
    });
  }
}

// Custom error classes for better error handling
class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export const apiClient = new ApiClient();
export { ApiError, AuthenticationError, AuthorizationError };