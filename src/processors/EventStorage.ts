import { ProcessedEvent } from '../models/Event';
import logger from '../utils/logger';

// Declare Node.js filesystem and path modules to avoid linter errors
declare const require: any;
const fs = require('fs');
const path = require('path');

/**
 * Simple file-based storage for processed events
 * In a production environment, this would be replaced with a proper database
 */
export class EventStorage {
  private storageDir: string;
  private eventsPerFile: number;
  private currentEvents: ProcessedEvent[] = [];
  private fileCounter: number = 0;

  constructor(storageDir: string = './data/events', eventsPerFile: number = 100) {
    this.storageDir = storageDir;
    this.eventsPerFile = eventsPerFile;
    this.initializeStorage();
  }

  /**
   * Initialize the storage directory
   */
  private initializeStorage(): void {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
        logger.info(`Created event storage directory at ${this.storageDir}`);
      }
      
      // Get the highest existing file counter
      const files = fs.readdirSync(this.storageDir);
      if (files.length > 0) {
        const counters = files
          .filter((file: string) => file.endsWith('.json'))
          .map((file: string) => parseInt(file.split('_')[1].split('.')[0], 10))
          .filter((num: number) => !isNaN(num));
        
        if (counters.length > 0) {
          this.fileCounter = Math.max(...counters) + 1;
        }
      }
      
      logger.info(`Event storage initialized with file counter: ${this.fileCounter}`);
    } catch (error: any) {
      logger.error(`Failed to initialize event storage: ${error.message}`);
    }
  }

  /**
   * Store a processed event
   */
  public async storeEvent(event: ProcessedEvent): Promise<void> {
    try {
      // Add event to current batch
      this.currentEvents.push(event);
      
      // If batch is full, write to file
      if (this.currentEvents.length >= this.eventsPerFile) {
        await this.flushEvents();
      }
    } catch (error: any) {
      logger.error(`Failed to store event: ${error.message}`);
    }
  }

  /**
   * Write current events to disk and clear the buffer
   */
  public async flushEvents(): Promise<void> {
    if (this.currentEvents.length === 0) return;
    
    try {
      const filename = path.join(this.storageDir, `events_${this.fileCounter}.json`);
      const data = JSON.stringify(this.currentEvents, null, 2);
      
      await fs.promises.writeFile(filename, data);
      logger.info(`Wrote ${this.currentEvents.length} events to ${filename}`);
      
      // Clear current events and increment file counter
      this.currentEvents = [];
      this.fileCounter++;
    } catch (error: any) {
      logger.error(`Failed to flush events: ${error.message}`);
    }
  }

  /**
   * Query events by criteria
   */
  public async queryEvents(criteria: Partial<ProcessedEvent>, limit: number = 100): Promise<ProcessedEvent[]> {
    try {
      const files = fs.readdirSync(this.storageDir)
        .filter((file: string) => file.endsWith('.json'))
        .sort((a: string, b: string) => {
          const numA = parseInt(a.split('_')[1].split('.')[0], 10);
          const numB = parseInt(b.split('_')[1].split('.')[0], 10);
          return numB - numA; // Sort descending to get most recent first
        });
      
      let results: ProcessedEvent[] = [];
      
      // Iterate through files until we find enough matching events
      for (const file of files) {
        if (results.length >= limit) break;
        
        const filePath = path.join(this.storageDir, file);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const events: ProcessedEvent[] = JSON.parse(fileData);
        
        // Filter events based on criteria
        const matchingEvents = events.filter(event => {
          return Object.entries(criteria).every(([key, value]) => {
            return event[key as keyof ProcessedEvent] === value;
          });
        });
        
        results = [...results, ...matchingEvents].slice(0, limit);
      }
      
      return results;
    } catch (error: any) {
      logger.error(`Failed to query events: ${error.message}`);
      return [];
    }
  }
} 