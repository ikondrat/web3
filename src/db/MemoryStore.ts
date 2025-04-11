import { Store } from './Store';

/**
 * In-memory implementation of the Store interface
 * Useful for development and testing
 */
export class MemoryStore<T extends { id: string }> implements Store<T> {
  private items: Map<string, T>;

  constructor() {
    this.items = new Map<string, T>();
  }

  /**
   * Save an item to the store
   * @param item The item to save
   * @returns Promise resolving to the saved item
   */
  async save(item: T): Promise<T> {
    this.items.set(item.id, { ...item });
    return item;
  }

  /**
   * Get an item by its ID
   * @param id The ID of the item to retrieve
   * @returns Promise resolving to the item or null if not found
   */
  async getById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  /**
   * Find items matching a filter
   * @param filter The filter criteria
   * @returns Promise resolving to an array of matching items
   */
  async find(filter: Partial<T>): Promise<T[]> {
    return Array.from(this.items.values())
      .filter(item => {
        return Object.entries(filter).every(([key, value]) => {
          return item[key as keyof T] === value;
        });
      })
      .map(item => ({ ...item }));
  }

  /**
   * Update an existing item
   * @param id The ID of the item to update
   * @param updates The updates to apply
   * @returns Promise resolving to the updated item or null if not found
   */
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existingItem = this.items.get(id);
    
    if (!existingItem) {
      return null;
    }
    
    const updatedItem = { ...existingItem, ...updates };
    this.items.set(id, updatedItem);
    
    return { ...updatedItem };
  }

  /**
   * Delete an item by its ID
   * @param id The ID of the item to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    if (!this.items.has(id)) {
      return false;
    }
    
    return this.items.delete(id);
  }
} 