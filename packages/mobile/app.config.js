/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

// Load .env file from mobile package root
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      // Supabase
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      // API settings
      apiTimeout: process.env.API_TIMEOUT,
      // Feature flags
      enableOfflineMode: process.env.ENABLE_OFFLINE_MODE,
    },
  };
};
