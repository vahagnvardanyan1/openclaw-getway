import dotenv from 'dotenv';
import { resolve, join } from 'node:path';
import { homedir, tmpdir } from 'node:os';

// Load .env from project root (parent of server/)
dotenv.config({ path: resolve(process.cwd(), '..', '.env') });
// Also try cwd in case server is run from project root
dotenv.config();

export const config = {
  port: parseInt(process.env.BRIDGE_PORT || '3001', 10),
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
