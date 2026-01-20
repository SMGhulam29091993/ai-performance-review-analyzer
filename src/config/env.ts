import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "Production",
  port: process.env.PORT ?? 4040,
  frontendUrl: process.env.FRONTEND_URL,
  dbURL: process.env.MONGO_URI,
  geminiAPI: process.env.GEMINI_API_KEY,

  // Backend JWT (keep server-side only)
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE ?? "7d",

  // Expose for CORS (backend)
  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  // Rate Limiting (backend)
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000"),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "100"),

  // Azure AD - Frontend (Vite exposes VITE_*)
  azureClientId: process.env.VITE_AZURE_CLIENT_ID,
  azureTenantId: process.env.VITE_AZURE_TENANT_ID,
  azureAuthority: process.env.VITE_AZURE_AUTHORITY?.replace(
    "{tenant_id}",
    process.env.VITE_AZURE_TENANT_ID ?? "common",
  ),
};
