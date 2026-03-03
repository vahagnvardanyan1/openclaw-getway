import dotenv from 'dotenv';
import { resolve, join } from 'node:path';
import { homedir, tmpdir } from 'node:os';

// In Vercel or other CI/CD, env vars are often pre-loaded into process.env.
// We still try to load .env for local development.

// Load .env from project root (parent of server/)
try {
  dotenv.config({ path: resolve(process.cwd(), '..', '.env') });
} catch (e) {
  // Ignore error if path is not accessible
}

// Also try cwd
try {
  dotenv.config();
} catch (e) {
  // Ignore error if path is not accessible
}

export const config = {
  port: parseInt(process.env.BRIDGE_PORT || process.env.PORT || '3001', 10),
  host: process.env.BRIDGE_HOST || '0.0.0.0',
  gateway: {
    url: process.env.OPENCLAW_GATEWAY_URL || 'ws://localhost:18789',
    token: process.env.OPENCLAW_GATEWAY_TOKEN || '',
  },
  agents: {
    pm: process.env.PM_AGENT_ID || 'pm',
    fe: process.env.FE_AGENT_ID || 'fe',
    qa: process.env.QA_AGENT_ID || 'qa',
    user: 'user',
  },
  // On Vercel, the filesystem is often read-only except for /tmp.
  // For local, we use the relative path from project root or server.
  taskDbPath: process.env.TASK_DB_PATH || 
    (process.env.VERCEL ? '/tmp/tasks.sqlite' : resolve(process.cwd(), '..', 'data', 'tasks.sqlite')),
  identityDir: process.env.OPENCLAW_IDENTITY_DIR || 
    (process.env.VERCEL ? join(tmpdir(), '.openclaw', 'bridge-server') : join(homedir(), '.openclaw', 'bridge-server')),
} as const;
