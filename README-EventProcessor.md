# Event Processor Module

This module processes blockchain events received from the Polkadot API Client, transforming raw events into structured data objects and providing configurable event handling and storage capabilities.

## Features

- Processes raw blockchain events into structured data
- Manages event subscription lifecycle
- Provides callback system for event notifications
- Supports configurable event persistence
- Handles historical event processing (placeholder)

## Directory Structure

```
src/
├── processors/
│   ├── EventProcessor.ts        # Main event processor implementation
│   ├── EventStorage.ts          # Simple file-based event storage
│   └── examples/                # Usage examples
│       └── eventProcessorExample.ts
├── models/
│   └── Event.ts                 # Event data models
└── clients/
    └── PolkadotApiClient.ts     # Polkadot API client (dependency)
```

## Usage

### Basic Usage

```typescript
import { PolkadotApiClient } from './clients/PolkadotApiClient';
import { EventProcessor } from './processors/EventProcessor';
import { ProcessedEvent } from './models/Event';

// Create a new Polkadot API client
const client = new PolkadotApiClient();

// Create an event processor
const processor = new EventProcessor(client);

// Register event callback
processor.onProcessedEvent((event: ProcessedEvent) => {
  console.log(`Processed event: ${event.section}.${event.method}`);
  
  // Handle specific event types
  if (event.section === 'balances' && event.method === 'Transfer') {
    const [from, to, amount] = event.data;
    console.log(`Transfer: ${from} -> ${to}, Amount: ${amount}`);
  }
});

// Start the processor
await processor.start();

// When done, stop the processor
await processor.stop();
```

### With Persistence

```typescript
import { PolkadotApiClient } from './clients/PolkadotApiClient';
import { EventProcessor } from './processors/EventProcessor';
import { EventStorage } from './processors/EventStorage';

// Create a new Polkadot API client
const client = new PolkadotApiClient();

// Create event storage
const storage = new EventStorage('./data/events');

// Create the Event Processor with persistence enabled
const processor = new EventProcessor(client, {
  persistEvents: true
});

// Register callback for processed events
processor.onProcessedEvent(async (event) => {
  // Store the event
  await storage.storeEvent(event);
});

// Start the processor
await processor.start();
```

## Configuration Options

The `EventProcessor` accepts the following options:

- `persistEvents`: Boolean flag to enable event persistence
- `processHistoricalEvents`: Boolean flag to enable processing of historical events
- `startBlock`: Block number to start processing from (when processing historical events)

## Event Storage

The module includes a simple file-based storage implementation for events:

```typescript
// Create event storage
const storage = new EventStorage('./data/events', 100);

// Store an event
await storage.storeEvent(event);

// Write all buffered events to disk
await storage.flushEvents();

// Query events
const transferEvents = await storage.queryEvents({ 
  section: 'balances', 
  method: 'Transfer' 
}, 10);
```

In a production environment, you would likely replace this with a proper database implementation.

## Next Steps

This module will be integrated with the Alert Service to generate alerts based on processed events. Future enhancements may include:

- Message queue integration for scalable event processing
- Support for complex event pattern recognition
- Time-series database integration for analytics
- Real-time event dashboard 