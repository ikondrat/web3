import { ProcessedEvent } from '../models/Event';
import { MemoryStore } from './MemoryStore';

/**
 * Store implementation for ProcessedEvents
 */
export class EventStore extends MemoryStore<ProcessedEvent> {
  /**
   * Find events by block number
   * @param blockNumber The block number
   * @returns Promise resolving to an array of events from the specified block
   */
  async findByBlockNumber(blockNumber: number): Promise<ProcessedEvent[]> {
    return this.find({ blockNumber });
  }

  /**
   * Find events by section and method
   * @param section The section name
   * @param method The method name
   * @returns Promise resolving to an array of matching events
   */
  async findByType(section: string, method: string): Promise<ProcessedEvent[]> {
    return Array.from((await this.find({ section })).filter(event => event.method === method));
  }

  /**
   * Get the latest block number from stored events
   * @returns Promise resolving to the latest block number or 0 if no events stored
   */
  async getLatestBlockNumber(): Promise<number> {
    const events = Array.from((await this.find({})));
    
    if (events.length === 0) {
      return 0;
    }
    
    return Math.max(...events.map(event => event.blockNumber));
  }
} 