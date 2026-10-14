// Environment-driven backend connection from client/.env ONLY
const rawApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : '/api/v1';

export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  (API_BASE_URL.startsWith('http') ? API_BASE_URL.replace(/\/api\/v1\/?$/, '') : '') ||
  'http://localhost:5000'
).replace(/\/+$/, '');

// In-flight deduplication and lightweight cache for GET requests
const inFlightRequests = new Map();
const memoryCache = new Map();
const CACHE_TTL_MS = 30000; // 30 seconds

export const clearApiCache = (pattern) => {
  if (!pattern) {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) memoryCache.delete(key);
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('v2_cms_updated', () => clearApiCache());
}

class ApiClient {
  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
    const method = (options.method || 'GET').toUpperCase();

    // Cache & In-flight deduplication for GET requests
    const isGet = method === 'GET';
    const isPublicCacheable = isGet && (
      cleanEndpoint.startsWith('/categories') ||
      cleanEndpoint.startsWith('/banners')
    );

    if (isPublicCacheable) {
      const cached = memoryCache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
      if (inFlightRequests.has(url)) {
        return inFlightRequests.get(url);
      }
    }

    const token = typeof window !== 'undefined' ? (localStorage.getItem('v2_token') || localStorage.getItem('token')) : null;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: 'include', // Automatically sends HTTP-only auth cookies
    };

    if (config.body && typeof config.body === 'object' && !isFormData) {
      config.body = JSON.stringify(config.body);
    }

    const executeFetch = async () => {
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

        if (isPublicCacheable) {
          memoryCache.set(url, { timestamp: Date.now(), data });
        }

        // Invalidate cache if mutating
        if (!isGet) {
          clearApiCache();
        }

        return data;
      } catch (error) {
        if (error.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
          // Handle unauthenticated state if needed
        }
        throw error;
      } finally {
        if (isPublicCacheable) {
          inFlightRequests.delete(url);
        }
      }
    };

    if (isPublicCacheable) {
      const promise = executeFetch();
      inFlightRequests.set(url, promise);
      return promise;
    }

    return executeFetch();
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

  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiClient();

