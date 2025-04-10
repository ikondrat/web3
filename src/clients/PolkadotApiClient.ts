import { ApiPromise, WsProvider } from '@polkadot/api';
import { EventRecord } from '@polkadot/types/interfaces';
import logger from '../utils/logger';
import config from '../config';

// Define the callback function type for handling events
export type EventCallback = (event: EventRecord) => void;

/**
 * PolkadotApiClient provides a wrapper around the Polkadot.js API,
 * handling connection, reconnection, and event subscriptions.
 */
export class PolkadotApiClient {
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;
  private eventCallbacks: EventCallback[] = [];
  private isConnected = false;
  private connectionAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize the Polkadot API client
   */
  constructor(private nodeUrl = config.nodeUrl) {}

  /**
   * Connect to the Polkadot node
   */
  public async connect(): Promise<boolean> {
    try {
      if (this.isConnected && this.api) {
        logger.info('Already connected to Polkadot node');
        return true;
      }

      logger.info(`Connecting to Polkadot node: ${this.nodeUrl}`);
      this.connectionAttempts++;

      // Create a new WebSocket provider
      this.provider = new WsProvider(this.nodeUrl, {
        connectTimeout: config.connectionTimeout,
      });

      // Create the API instance
      this.api = await ApiPromise.create({
        provider: this.provider,
      });

      // Wait for the API to be ready
      await this.api.isReady;
      this.isConnected = true;
      this.connectionAttempts = 0;

      // Subscribe to chain events
      await this.subscribeToEvents();

      const nodeInfo = await this.getNodeInfo();
      logger.info(`Connected to ${nodeInfo.chain} (${nodeInfo.version})`);

      return true;
    } catch (error) {
      logger.error(`Failed to connect to Polkadot node: ${(error as Error).message}`);
      
      // Attempt reconnection if not exceeded max retries
      if (this.connectionAttempts < config.maxRetries) {
        this.scheduleReconnect();
      } else {
        logger.error(`Max reconnection attempts (${config.maxRetries}) reached`);
      }
      
      return false;
    }
  }

  /**
   * Disconnect from the Polkadot node
   */
  public async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.api) {
      try {
        await this.api.disconnect();
        logger.info('Disconnected from Polkadot node');
      } catch (error) {
        logger.error(`Error during disconnect: ${(error as Error).message}`);
      } finally {
        this.api = null;
        this.provider = null;
        this.isConnected = false;
      }
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    logger.info(`Scheduling reconnection in ${config.reconnectInterval}ms (attempt ${this.connectionAttempts})`);
    
    this.reconnectTimer = setTimeout(async () => {
      await this.connect();
    }, config.reconnectInterval);
  }

  /**
   * Subscribe to all events from the chain
   */
  private async subscribeToEvents(): Promise<void> {
    if (!this.api || !this.isConnected) {
      throw new Error('Cannot subscribe to events: Not connected to Polkadot node');
    }

    try {
      // Subscribe to all system events
      await this.api.query.system.events((events: EventRecord[]) => {
        logger.debug(`Received ${events.length} events`);
        
        // Process each event
        events.forEach((eventRecord) => {
          this.processEvent(eventRecord);
        });
      });

      logger.info('Successfully subscribed to chain events');
    } catch (error) {
      logger.error(`Failed to subscribe to events: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Process a single event and notify all registered callbacks
   */
  private processEvent(event: EventRecord): void {
    try {
      // Call all registered event callbacks
      this.eventCallbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (callbackError) {
          logger.error(`Error in event callback: ${(callbackError as Error).message}`);
        }
      });
    } catch (error) {
      logger.error(`Error processing event: ${(error as Error).message}`);
    }
  }

  /**
   * Register a callback for event notifications
   */
  public onEvent(callback: EventCallback): void {
    this.eventCallbacks.push(callback);
    logger.debug('Registered new event callback');
  }

  /**
   * Remove a previously registered event callback
   */
  public removeEventCallback(callback: EventCallback): void {
    const initialLength = this.eventCallbacks.length;
    this.eventCallbacks = this.eventCallbacks.filter((cb) => cb !== callback);
    
    if (initialLength !== this.eventCallbacks.length) {
      logger.debug('Removed event callback');
    }
  }

  /**
   * Get node information including chain name and version
   */
  public async getNodeInfo(): Promise<{ chain: string; version: string }> {
    if (!this.api || !this.isConnected) {
      throw new Error('Cannot get node info: Not connected to Polkadot node');
    }

    try {
      // Fetch chain name and node version
      const [chain, nodeVersion] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.version(),
      ]);

      return {
        chain: chain.toString(),
        version: nodeVersion.toString(),
      };
    } catch (error) {
      logger.error(`Failed to get node info: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Check if the client is connected to the node
   */
  public isClientConnected(): boolean {
    return this.isConnected && this.api !== null;
  }
} 