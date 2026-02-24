import axios from 'axios';

export interface TokenValidationResponse {
  valid: boolean;
  subject_id?: string;
  subject_email?: string;
  org_id?: string;
  roles?: string[];
  error?: string;
}

export interface AuthorizationRequest {
  subject_id: string;
  role: string;
  resource: string;
  action: string;
  attributes?: Record<string, any>;
}

export interface AuthorizationResponse {
  allowed: boolean;
  reason: string;
  matched_policy?: string;
  resolved_roles?: string[];
}

export class AegisClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.AEGIS_BASE_URL || 'http://localhost:8080';
    this.apiKey = process.env.AEGIS_API_KEY;
  }

  private getHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async validateToken(token: string): Promise<TokenValidationResponse> {
    try {
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      const response = await axios.post<TokenValidationResponse>(
        `${this.baseUrl}/auth/validate`,
        { token: cleanToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Token validation failed',
      };
    }
  }

  async authorize(request: AuthorizationRequest): Promise<AuthorizationResponse> {
    try {
      const response = await axios.post<AuthorizationResponse>(
        `${this.baseUrl}/v1/authorize`,
        request,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      return {
        allowed: false,
        reason: error.message || 'Authorization check failed',
      };
    }
  }

  logEvent(eventType: string, payload: any, correlationId?: string): void {
    // Fire and forget logging
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event_type: eventType,
        service: 'plaza',
        payload,
        correlation_id: correlationId,
      };

      axios.post(`${this.baseUrl}/v1/logs`, logEntry, { headers: this.getHeaders() }).catch(() => {});
    } catch (e) {
      // Ignore
    }
  }
}

export const aegisClient = new AegisClient();
