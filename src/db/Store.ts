/**
 * Generic Store interface for database operations
 */
export interface Store<T> {
  /**
   * Save an item to the store
   * @param item The item to save
   * @returns Promise resolving to the saved item
   */
  save(item: T): Promise<T>;
  
  /**
   * Get an item by its ID
   * @param id The ID of the item to retrieve
   * @returns Promise resolving to the item or null if not found
   */
  getById(id: string): Promise<T | null>;
  
  /**
   * Find items matching a filter
   * @param filter The filter criteria
   * @returns Promise resolving to an array of matching items
   */
  find(filter: Partial<T>): Promise<T[]>;
  
  /**
   * Update an existing item
   * @param id The ID of the item to update
   * @param updates The updates to apply
   * @returns Promise resolving to the updated item or null if not found
   */
  update(id: string, updates: Partial<T>): Promise<T | null>;
  
  /**
   * Delete an item by its ID
   * @param id The ID of the item to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
} 