import { createSignal, createEffect } from 'solid-js';
import { API } from '../api';

/**
 * Otherlink Store
 * Manages the currently selected otherlink and provides global access
 */
class OtherlinkStore {
  constructor() {
    // Get initial value from localStorage or null
    const savedId = localStorage.getItem('selectedOtherlinkId');
    const [selectedOtherlinkId, setSelectedOtherlinkId] = createSignal(savedId);
    const [selectedOtherlink, setSelectedOtherlink] = createSignal(null);
    const [otherlinks, setOtherlinks] = createSignal([]);
    const [loading, setLoading] = createSignal(false);

    this.selectedOtherlinkId = selectedOtherlinkId;
    this.setSelectedOtherlinkId = setSelectedOtherlinkId;
    this.selectedOtherlink = selectedOtherlink;
    this.setSelectedOtherlink = setSelectedOtherlink;
    this.otherlinks = otherlinks;
    this.setOtherlinks = setOtherlinks;
    this.loading = loading;
    this.setLoading = setLoading;

    // Persist to localStorage whenever selection changes
    createEffect(() => {
      const id = this.selectedOtherlinkId();
      if (id) {
        localStorage.setItem('selectedOtherlinkId', id);
      } else {
        localStorage.removeItem('selectedOtherlinkId');
      }
    });
  }

  /**
   * Load all otherlinks for the user
   */
  async loadOtherlinks() {
    try {
      this.setLoading(true);
      const response = await API.otherlink.getOtherlinks(1, 100);
      
      console.log('Loaded otherlinks:', response);
      
      if (response.status && response.data.otherlinks) {
        this.setOtherlinks(response.data.otherlinks);
        console.log('Set otherlinks count:', response.data.otherlinks.length);

        // If no otherlink is selected but we have otherlinks, select the first one
        if (!this.selectedOtherlinkId() && response.data.otherlinks.length > 0) {
          this.selectOtherlink(response.data.otherlinks[0].id);
        } 
        // If we have a selected ID, load its details
        else if (this.selectedOtherlinkId()) {
          await this.loadSelectedOtherlink();
        }
      } else {
        console.warn('No otherlinks in response or invalid response status');
      }
    } catch (error) {
      console.error('Failed to load otherlinks:', error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load the full details of the currently selected otherlink
   */
  async loadSelectedOtherlink() {
    const id = this.selectedOtherlinkId();
    if (!id) return;

    try {
      const response = await API.otherlink.getOtherlink(id);
      if (response.status && response.data.otherlink) {
        this.setSelectedOtherlink(response.data.otherlink);
      }
    } catch (error) {
      console.error('Failed to load selected otherlink:', error);
      // If the otherlink doesn't exist anymore, clear selection
      this.setSelectedOtherlinkId(null);
      this.setSelectedOtherlink(null);
    }
  }

  /**
   * Select an otherlink by ID
   */
  async selectOtherlink(otherlinkId) {
    this.setSelectedOtherlinkId(otherlinkId);
    await this.loadSelectedOtherlink();
  }

  /**
   * Clear the selected otherlink
   */
  clearSelection() {
    this.setSelectedOtherlinkId(null);
    this.setSelectedOtherlink(null);
  }

  /**
   * Add a new otherlink to the list and select it
   */
  addOtherlink(otherlink) {
    this.setOtherlinks([otherlink, ...this.otherlinks()]);
    this.selectOtherlink(otherlink.id);
  }

  /**
   * Update an otherlink in the list
   */
  updateOtherlink(updatedOtherlink) {
    this.setOtherlinks(
      this.otherlinks().map(o => o.id === updatedOtherlink.id ? updatedOtherlink : o)
    );
    
    // Update selected if it's the one being updated
    if (this.selectedOtherlinkId() === updatedOtherlink.id) {
      this.setSelectedOtherlink(updatedOtherlink);
    }
  }

  /**
   * Remove an otherlink from the list
   */
  removeOtherlink(otherlinkId) {
    this.setOtherlinks(this.otherlinks().filter(o => o.id !== otherlinkId));
    
    // If we removed the selected otherlink, select another one
    if (this.selectedOtherlinkId() === otherlinkId) {
      const remaining = this.otherlinks();
      if (remaining.length > 0) {
        this.selectOtherlink(remaining[0].id);
      } else {
        this.clearSelection();
      }
    }
  }

  /**
   * Refresh the current selection
   */
  async refresh() {
    await this.loadOtherlinks();
  }

  /**
   * Clear all otherlink data (e.g., on logout)
   */
  clear() {
    this.setOtherlinks([]);
    this.setSelectedOtherlinkId(null);
    this.setSelectedOtherlink(null);
    localStorage.removeItem('selectedOtherlinkId');
  }

  /**
   * Check if user has any otherlinks
   */
  hasOtherlinks() {
    return this.otherlinks().length > 0;
  }
}

// Create and export singleton instance
export const otherlinkStore = new OtherlinkStore();

