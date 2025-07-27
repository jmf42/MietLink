import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please check your .env file and ensure your Supabase connection string is configured."
  );
}

// Create connection pool with Supabase-optimized settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  // SSL configuration for Supabase
  ssl: { rejectUnauthorized: false, require: true },
});

// Initialize Drizzle with the connection pool
export const db = drizzle(pool, { schema });

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});