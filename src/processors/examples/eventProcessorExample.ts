import { PolkadotApiClient } from '../../clients/PolkadotApiClient';
import { EventProcessor } from '../EventProcessor';
import { EventStorage } from '../EventStorage';
import { ProcessedEvent } from '../../models/Event';
import logger from '../../utils/logger';

// Declare Node.js types to avoid linter errors
declare const process: {
  exit: (code?: number) => never;
  on: (event: string, callback: (...args: any[]) => void) => void;
};
declare const setInterval: (callback: (...args: any[]) => void, ms: number) => number;
declare const require: any;
declare const module: { exports: any };

/**
 * Example implementation showing how to use the Event Processor
 */
async function main() {
  logger.info('Starting Event Processor Example');

  try {
    // Create the Polkadot client
    const client = new PolkadotApiClient();
    
    // Create event storage
    const storage = new EventStorage('./data/events', 50);
    
    // Create the Event Processor with persistence enabled
    const processor = new EventProcessor(client, {
      persistEvents: true,
      processHistoricalEvents: false
    });
    
    // Register callback for processed events
    processor.onProcessedEvent(async (event: ProcessedEvent) => {
      logger.info(`Processed event: ${event.section}.${event.method}`);
      
      // Store the event
      if (processor.options.persistEvents) {
        await storage.storeEvent(event);
      }
      
      // Example of handling specific event types
      if (event.section === 'balances' && event.method === 'Transfer') {
        const [from, to, amount] = event.data;
        logger.info(`Transfer: ${from} -> ${to}, Amount: ${amount}`);
        
        // In a real implementation, you might trigger alerts or notifications here
      }
    });
    
    // Start the processor
    const started = await processor.start();
    if (!started) {
      logger.error('Failed to start event processor');
      process.exit(1);
    }
    
    // Capture block information from the client
    // In a real implementation, we would subscribe to new block events
    // and update this information accordingly
    setInterval(() => {
      // This is just a placeholder - in a real implementation you would
      // get this information from newHead subscription
      const blockNumber = Math.floor(Date.now() / 6000); // Fake block number for example
      const blockHash = `0x${blockNumber.toString(16).padStart(64, '0')}`;
      
      processor.updateBlockInfo(blockNumber, blockHash);
    }, 6000); // Update every 6 seconds (typical Polkadot block time)
    
    // Handle application shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down...');
      await processor.stop();
      await storage.flushEvents();
      await client.disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Shutting down...');
      await processor.stop();
      await storage.flushEvents();
      await client.disconnect();
      process.exit(0);
    });
    
    logger.info('Event Processor Example running. Press Ctrl+C to exit.');
  } catch (error: any) {
    logger.error(`Application error: ${error.message}`);
    process.exit(1);
  }
}

// Start the example
if (require.main === module) {
  main().catch((error) => {
    logger.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
} 