import { config } from './env.js';

const parseAllowedOrigins = () => {
  const defaults = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://vsquareseafood.vercel.app',
  ];

  if (config.clientUrl) {
    const urls = config.clientUrl.split(',').map((u) => u.trim()).filter(Boolean);
    urls.forEach((u) => {
      if (!defaults.includes(u)) {
        defaults.push(u);
      }
    });
  }

  return defaults;
};

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, mobile app, or curl requests with no origin
    if (!origin) {
      return callback(null, true);
    }

    const allowed = parseAllowedOrigins();
    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    // Allow all vercel preview or production subdomains
    if (/^https:\/\/[a-zA-Z0-9_\-.]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow Render app subdomains
    if (/^https:\/\/[a-zA-Z0-9_\-.]+\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }

    // Allow localhost on any port
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

