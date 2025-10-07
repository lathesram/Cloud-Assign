import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface AuthVerificationResponse {
  success: boolean;
  user?: {
    userId: string;
    email: string;
    name: string;
    type: 'mentor' | 'mentee';
  };
  message?: string;
}

export class AuthServiceClient {
  private client: AxiosInstance;

  constructor() {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http:'

    this.client = axios.create({
      baseURL: authServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  }

  /**
   * Verify JWT token with auth service
   */
  async verifyToken(token: string): Promise<AuthVerificationResponse> {
    try {
      const response: AxiosResponse<AuthVerificationResponse> = await this.client.post(
        '/api/auth/verify-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthVerificationResponse;
      }

      return {
        success: false,
        message: 'Auth service unavailable',
      };
    }
  }

  /**
   * Health check for auth service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate user for messaging (check if user exists and is active)
   */
  async validateMessagingUser(userId: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await this.client.get(`/api/auth/users/${userId}/validate`);
      return {
        valid: true,
        user: response.data.user
      };
    } catch (error) {
      return {
        valid: false
      };
    }
  }
}
