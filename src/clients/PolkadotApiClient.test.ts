import { PolkadotApiClient } from './PolkadotApiClient';
import { ApiPromise } from '@polkadot/api';

// Mock the @polkadot/api module
jest.mock('@polkadot/api', () => {
  // Mock event data
  const mockEventData = [
    { toString: () => 'data1' },
    { toString: () => 'data2' },
  ];
  
  // Mock event
  const mockEvent = {
    section: { toString: () => 'balances' },
    method: { toString: () => 'Transfer' },
    data: mockEventData,
  };
  
  // Mock event record
  const mockEventRecord = {
    event: mockEvent,
    phase: { toString: () => 'finalization' },
    topics: [],
  };

  // Mock system.events query result
  const mockEventsCallback = jest.fn();
  
  // Mock API class
  class MockApiPromise {
    isReady = Promise.resolve(this);
    
    constructor() {}
    
    static create = jest.fn().mockImplementation(() => {
      return Promise.resolve(new MockApiPromise());
    });
    
    disconnect = jest.fn().mockResolvedValue(undefined);
    
    query = {
      system: {
        events: jest.fn().mockImplementation((callback) => {
          mockEventsCallback = callback;
          // Immediately call with mock events
          setTimeout(() => {
            callback([mockEventRecord]);
          }, 0);
          return Promise.resolve();
        }),
      },
    };
    
    rpc = {
      system: {
        chain: jest.fn().mockResolvedValue({ toString: () => 'Polkadot' }),
        version: jest.fn().mockResolvedValue({ toString: () => '1.0.0' }),
      },
    };
  }

  // Mock WsProvider
  class MockWsProvider {
    constructor() {}
  }

  return {
    ApiPromise: MockApiPromise,
    WsProvider: MockWsProvider,
    // Function to trigger mock events for testing
    __triggerEvents: (events: any[]) => {
      if (mockEventsCallback) {
        mockEventsCallback(events);
      }
    },
  };
});

describe('PolkadotApiClient', () => {
  let client: PolkadotApiClient;

  beforeEach(() => {
    client = new PolkadotApiClient('wss://test.node');
  });

  afterEach(async () => {
    await client.disconnect();
    jest.clearAllMocks();
  });

  it('should connect to a Polkadot node', async () => {
    const result = await client.connect();
    
    expect(result).toBe(true);
    expect(ApiPromise.create).toHaveBeenCalled();
    expect(client.isClientConnected()).toBe(true);
  });

  it('should get node information', async () => {
    await client.connect();
    
    const nodeInfo = await client.getNodeInfo();
    
    expect(nodeInfo).toEqual({
      chain: 'Polkadot',
      version: '1.0.0',
    });
  });

  it('should handle event callbacks', async () => {
    const mockCallback = jest.fn();
    
    client.onEvent(mockCallback);
    await client.connect();
    
    // Wait for mock events to be processed
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should remove event callbacks', async () => {
    const mockCallback = jest.fn();
    
    client.onEvent(mockCallback);
    client.removeEventCallback(mockCallback);
    await client.connect();
    
    // Wait for mock events to be processed
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
}); 