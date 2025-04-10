# Polkadot.js API Client Module

This module provides a robust client for connecting to the Polkadot blockchain and subscribing to events. It's the foundation of our monitoring system, handling connection management, reconnection logic, and event subscription.

## Features

- Connects to Polkadot nodes via WebSocket
- Handles connection failures and automatic reconnection
- Subscribes to blockchain events
- Provides event filtering capabilities
- Implements a callback system for event notifications

## Directory Structure

```
src/
├── clients/
│   ├── PolkadotApiClient.ts    # Main API client implementation
│   └── EventFilter.ts          # Event filtering utilities
├── utils/
│   └── logger.ts               # Logging functionality
├── config.ts                   # Configuration loading
└── index.ts                    # Example usage
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit the `.env` file to configure:
- `POLKADOT_NODE_URL`: WebSocket URL of the Polkadot node (e.g., wss://rpc.polkadot.io)
- `CONNECTION_TIMEOUT_MS`: Connection timeout in milliseconds
- `RECONNECT_INTERVAL_MS`: Reconnection interval in milliseconds
- `MAX_RETRIES`: Maximum number of reconnection attempts
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Usage

```typescript
import { PolkadotApiClient } from './clients/PolkadotApiClient';
import { EventFilter } from './clients/EventFilter';

// Create a new API client
const client = new PolkadotApiClient();

// Register event callback
client.onEvent((event) => {
  // Filter for specific events
  if (EventFilter.matchesCriteria(event, { section: 'balances', method: 'Transfer' })) {
    const formattedEvent = EventFilter.formatEvent(event);
    console.log(`Balance transfer detected: ${formattedEvent}`);
  }
});

// Connect to the Polkadot node
await client.connect();

// When done, disconnect
await client.disconnect();
```

## Event Filtering

The `EventFilter` class provides utilities for filtering events:

```typescript
// Filter for specific event types
const isTransfer = EventFilter.matchesCriteria(event, { 
  section: 'balances', 
  method: 'Transfer' 
});

// Format events as human-readable strings
const eventString = EventFilter.formatEvent(event);
```

## Running the Example

The example application monitors several important event types:
- Balance transfers (`balances.Transfer`)
- Validator slashing (`staking.Slashed`)
- Governance proposals (`democracy.Proposed`)
- Council proposals (`council.Proposed`)
- Failed transactions (`system.ExtrinsicFailed`)

To run the example:

```bash
npm run dev
```

## Next Steps

This module will be integrated with the Event Processor to handle more complex event analysis and alert generation. The current implementation focuses on establishing a reliable connection to the blockchain and providing clean abstractions for event handling. 