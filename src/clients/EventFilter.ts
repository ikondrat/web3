import { EventRecord } from '@polkadot/types/interfaces';
import logger from '../utils/logger';

/**
 * Criteria for filtering blockchain events
 */
export interface EventFilterCriteria {
  section?: string;
  method?: string;
}

/**
 * EventFilter provides utilities for filtering blockchain events by section and method
 */
export class EventFilter {
  /**
   * Check if an event matches the specified criteria
   */
  public static matchesCriteria(event: EventRecord, criteria: EventFilterCriteria): boolean {
    try {
      const { section, method } = event.event;
      
      // Check section match if specified
      if (criteria.section && section.toString() !== criteria.section) {
        return false;
      }
      
      // Check method match if specified
      if (criteria.method && method.toString() !== criteria.method) {
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error matching event criteria: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Filter an array of events based on the specified criteria
   */
  public static filterEvents(
    events: EventRecord[],
    criteria: EventFilterCriteria
  ): EventRecord[] {
    return events.filter((event) => this.matchesCriteria(event, criteria));
  }

  /**
   * Format an event to a human-readable string representation
   */
  public static formatEvent(event: EventRecord): string {
    try {
      const { section, method, data } = event.event;
      const params = data.map((param) => param.toString()).join(', ');
      
      return `${section}.${method}(${params})`;
    } catch (error) {
      logger.error(`Error formatting event: ${(error as Error).message}`);
      return 'Event format error';
    }
  }

  /**
   * Get the section and method of an event as a string
   */
  public static getEventType(event: EventRecord): string {
    try {
      const { section, method } = event.event;
      return `${section}.${method}`;
    } catch (error) {
      logger.error(`Error getting event type: ${(error as Error).message}`);
      return 'unknown.unknown';
    }
  }
} 