import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface Config {
  nodeUrl: string;
  connectionTimeout: number;
  reconnectInterval: number;
  maxRetries: number;
  logLevel: string;
}

const config: Config = {
  nodeUrl: process.env.POLKADOT_NODE_URL || 'wss://rpc.polkadot.io',
  connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT_MS || '60000', 10),
  reconnectInterval: parseInt(process.env.RECONNECT_INTERVAL_MS || '5000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '10', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config; 