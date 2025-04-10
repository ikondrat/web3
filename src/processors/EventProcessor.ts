import { v4 as uuidv4 } from 'uuid';
import { EventRecord } from '@polkadot/types/interfaces';
import { PolkadotApiClient } from '../clients/PolkadotApiClient';
import { EventFilter } from '../clients/EventFilter';
import { ProcessedEvent, EventProcessorOptions, EventProcessorCallback } from '../models/Event';
import logger from '../utils/logger';

interface BlockInfo {
  number: number;
  hash: string;
}

export class EventProcessor {
  private client: PolkadotApiClient;
  private callbacks: EventProcessorCallback[] = [];
  public options: EventProcessorOptions;
  private processingEnabled: boolean = false;
  private latestBlockInfo: BlockInfo = { number: 0, hash: '' };

  constructor(client: PolkadotApiClient, options: EventProcessorOptions = {}) {
    this.client = client;
    this.options = options;
    
    // Register event handler with the client
    this.client.onEvent(this.handleEvent.bind(this));
  }

  /**
   * Start processing events
   */
  public async start(): Promise<boolean> {
    logger.info('Starting Event Processor');
    
    if (!this.client.isClientConnected()) {
      const connected = await this.client.connect();
      if (!connected) {
        logger.error('Failed to connect to Polkadot node');
        return false;
      }
    }
    
    this.processingEnabled = true;
    
    // Process historical events if configured
    if (this.options.processHistoricalEvents && this.options.startBlock) {
      logger.info(`Processing historical events from block ${this.options.startBlock}`);
      // Historical event processing would go here
      // This would require additional implementation
    }
    
    logger.info('Event Processor started successfully');
    return true;
  }

  /**
   * Stop processing events
   */
  public async stop(): Promise<void> {
    logger.info('Stopping Event Processor');
    this.processingEnabled = false;
  }

  /**
   * Register a callback to be invoked when events are processed
   */
  public onProcessedEvent(callback: EventProcessorCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Set the latest block information
   */
  public updateBlockInfo(blockNumber: number, blockHash: string): void {
    this.latestBlockInfo = {
      number: blockNumber,
      hash: blockHash
    };
  }

  /**
   * Handle raw events from the client
   */
  private async handleEvent(event: any): Promise<void> {
    if (!this.processingEnabled) return;
    
    try {
      // Transform the raw event into a processed event
      const processedEvent = this.processEvent(event);
      
      // Notify all registered callbacks
      for (const callback of this.callbacks) {
        await Promise.resolve(callback(processedEvent));
      }
      
      // Persistence would go here if enabled
      if (this.options.persistEvents) {
        // Store the event in a database
        // This would require additional implementation
        logger.debug(`Event ${processedEvent.id} would be persisted here`);
      }
    } catch (error: any) {
      logger.error(`Error processing event: ${error.message}`);
    }
  }

  /**
   * Transform a raw event into a processed event
   */
  private processEvent(event: any): ProcessedEvent {
    const { event: { section, method, data }, phase } = event;
    const eventType = EventFilter.getEventType(event);
    
    const processedEvent: ProcessedEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      blockNumber: this.latestBlockInfo.number,
      blockHash: this.latestBlockInfo.hash,
      section: section.toString(),
      method: method.toString(),
      data: data.toJSON(),
      raw: event
    };
    
    logger.debug(`Processed event: ${eventType}`, { eventId: processedEvent.id });
    return processedEvent;
  }

  /**
   * Generate a unique ID for events
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  }
} 