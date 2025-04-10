import { PolkadotApiClient } from './clients/PolkadotApiClient';
import { EventFilter } from './clients/EventFilter';
import logger from './utils/logger';

// Define the events we're interested in monitoring
const MONITORED_EVENTS = [
  { section: 'balances', method: 'Transfer' },      // Balance transfers
  { section: 'staking', method: 'Slashed' },        // Validator slashing events
  { section: 'democracy', method: 'Proposed' },     // New governance proposals
  { section: 'council', method: 'Proposed' },       // New council proposals
  { section: 'system', method: 'ExtrinsicFailed' }, // Failed extrinsics
];

async function main() {
  logger.info('Starting Polkadot Monitoring System');

  // Create a new API client
  const client = new PolkadotApiClient();

  // Register event callback
  client.onEvent((event) => {
    // Get the event type
    const eventType = EventFilter.getEventType(event);

    // Check if this is an event we're monitoring
    const isMonitored = MONITORED_EVENTS.some(
      (criteria) => EventFilter.matchesCriteria(event, criteria)
    );

    if (isMonitored) {
      // If this is a monitored event, log it with INFO level
      const formattedEvent = EventFilter.formatEvent(event);
      logger.info(`Monitored event detected: ${eventType} - ${formattedEvent}`);
      
      // Here we would notify the Event Processor
      // This will be implemented in the next module
    } else {
      // For other events, just log with DEBUG level
      logger.debug(`Event received: ${eventType}`);
    }
  });

  // Connect to the Polkadot node
  const connected = await client.connect();

  if (!connected) {
    logger.error('Failed to connect to Polkadot node, exiting');
    process.exit(1);
  }

  // Handle application shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await client.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await client.disconnect();
    process.exit(0);
  });

  logger.info('Monitoring system initialized and running');
}

// Start the application
main().catch((error) => {
  logger.error(`Application error: ${error.message}`);
  process.exit(1);
}); 