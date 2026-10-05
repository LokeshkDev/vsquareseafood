const API_BASE_URL = '/api/v1';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: 'include', // Automatically sends HTTP-only auth cookies
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return null;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && endpoint === '/auth/me') {
          return { success: false, data: null };
        }
        const error = new Error(data.message || 'An error occurred with the server');
        error.status = response.status;
        error.code = data.code;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
        // Handle unauthenticated state if needed
      }
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`${endpoint}${queryString}`, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

