import dotenv from 'dotenv';
dotenv.config();

// Auto-construct DATABASE_URL if individual Lightsail variables are provided
let databaseUrl = process.env.DATABASE_URL;
const host = process.env.LIGHTSAIL_DB_HOST;
const isPlaceholder = !host || host.includes('YOUR_LIGHTSAIL');

if ((!databaseUrl || databaseUrl.includes('YOUR_LIGHTSAIL')) && !isPlaceholder) {
  const user = encodeURIComponent(process.env.LIGHTSAIL_DB_USER || 'root');
  const pass = encodeURIComponent(process.env.LIGHTSAIL_DB_PASSWORD || '');
  const port = process.env.LIGHTSAIL_DB_PORT || 3306;
  const name = process.env.LIGHTSAIL_DB_NAME || 'vsquare_seafood';
  databaseUrl = `mysql://${user}:${pass}@${host}:${port}/${name}?connect_timeout=30&pool_timeout=30`;
  process.env.DATABASE_URL = databaseUrl;
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  r2: {
    get accountId() { return process.env.R2_ACCOUNT_ID ? process.env.R2_ACCOUNT_ID.trim() : null; },
    get accessKeyId() { return process.env.R2_ACCESS_KEY_ID ? process.env.R2_ACCESS_KEY_ID.trim() : null; },
    get secretAccessKey() { return process.env.R2_SECRET_ACCESS_KEY ? process.env.R2_SECRET_ACCESS_KEY.trim() : null; },
    get bucketName() { return process.env.R2_BUCKET_NAME ? process.env.R2_BUCKET_NAME.trim() : 'vsquare-seafood'; },
    get endpoint() { return process.env.R2_ENDPOINT ? process.env.R2_ENDPOINT.trim() : null; },
    get publicBaseUrl() { return process.env.R2_PUBLIC_BASE_URL ? process.env.R2_PUBLIC_BASE_URL.trim() : null; },
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'V2 Seafood <noreply@vsquareseafood.com>',
  },
};
