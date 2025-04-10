export interface ProcessedEvent {
  id: string;
  timestamp: Date;
  blockNumber: number;
  blockHash: string;
  section: string;
  method: string;
  data: any;
  raw: any;
}

export interface EventProcessorOptions {
  persistEvents?: boolean;
  processHistoricalEvents?: boolean;
  startBlock?: number;
}

export type EventProcessorCallback = (event: ProcessedEvent) => void | Promise<void>; 