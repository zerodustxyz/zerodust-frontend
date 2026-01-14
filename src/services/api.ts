// ZeroDust Backend API Service

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export interface QuoteRequest {
  chainId: number;
  userAddress: string;
  destinationAddress: string;
}

export interface QuoteResponse {
  quoteId: string;
  chainId: number;
  userAddress: string;
  destinationAddress: string;
  estimatedBalance: string;
  fee: string;
  feeUsd: string;
  estimatedReceive: string;
  gasPrice: string;
  gasLimit: string;
  expiresAt: string;
  eip712Message: {
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: string;
    };
    types: {
      SweepAuthorization: Array<{ name: string; type: string }>;
    };
    primaryType: string;
    message: {
      quoteId: string;
      user: string;
      destination: string;
      chainId: number;
      fee: string;
      nonce: number;
      deadline: number;
    };
  };
}

export interface SweepRequest {
  quoteId: string;
  eip712Signature: string;
  eip7702Authorization: {
    chainId: string;
    address: string;
    nonce: string;
    yParity: string;
    r: string;
    s: string;
  };
}

export interface SweepResponse {
  sweepId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
}

export interface SweepStatusResponse {
  sweepId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  error?: string;
  completedAt?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  /**
   * Get a quote for sweeping a wallet
   */
  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return fetchApi<QuoteResponse>('/quote', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Submit a signed sweep request
   */
  async submitSweep(request: SweepRequest): Promise<SweepResponse> {
    return fetchApi<SweepResponse>('/sweep', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get the status of a sweep
   */
  async getSweepStatus(sweepId: string): Promise<SweepStatusResponse> {
    return fetchApi<SweepStatusResponse>(`/sweep/${sweepId}`);
  },

  /**
   * Poll for sweep completion
   */
  async pollSweepStatus(
    sweepId: string,
    onUpdate?: (status: SweepStatusResponse) => void,
    maxAttempts = 60,
    intervalMs = 2000
  ): Promise<SweepStatusResponse> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getSweepStatus(sweepId);

      if (onUpdate) {
        onUpdate(status);
      }

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Sweep timed out');
  },
};

export { ApiError };
