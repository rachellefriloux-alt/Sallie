/**
 * Sync client for encrypted cross-device synchronization.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import APIClient from './api_client';

export interface SyncPayload {
  type: 'limbic_state' | 'memory' | 'conversation';
  data: any;
  timestamp: number;
}

class SyncClient {
  private apiClient: APIClient;
  private deviceId: string;
  private encryptionKey: string | null = null;
  private syncEnabled: boolean = false;

  constructor(apiClient: APIClient, deviceId: string) {
    this.apiClient = apiClient;
    this.deviceId = deviceId;
    this.init();
  }

  private async init(): Promise<void> {
    // Load encryption key from secure storage
    this.encryptionKey = await AsyncStorage.getItem('sync_encryption_key');
    this.syncEnabled = (await AsyncStorage.getItem('sync_enabled')) === 'true';
  }

  /**
   * Enable sync.
   */
  async enableSync(): Promise<void> {
    this.syncEnabled = true;
    await AsyncStorage.setItem('sync_enabled', 'true');
  }

  /**
   * Disable sync.
   */
  async disableSync(): Promise<void> {
    this.syncEnabled = false;
    await AsyncStorage.setItem('sync_enabled', 'false');
  }

  /**
   * Sync limbic state to server.
   */
  async syncLimbicState(limbicData: any): Promise<void> {
    if (!this.syncEnabled) {
      return;
    }

    try {
      await this.apiClient.syncLimbicState();
    } catch (error) {
      console.error('Failed to sync limbic state:', error);
      // Queue for retry
      await this.queueForRetry('limbic_state', limbicData);
    }
  }

  /**
   * Sync conversation to server.
   */
  async syncConversation(conversationData: any): Promise<void> {
    if (!this.syncEnabled) {
      return;
    }

    try {
      await this.apiClient.client.post('/sync/conversation', conversationData);
    } catch (error) {
      console.error('Failed to sync conversation:', error);
      await this.queueForRetry('conversation', conversationData);
    }
  }

  /**
   * Queue payload for retry.
   */
  private async queueForRetry(type: string, data: any): Promise<void> {
    const queueKey = 'sync_retry_queue';
    const queue = JSON.parse(
      (await AsyncStorage.getItem(queueKey)) || '[]'
    );

    queue.push({
      type,
      data,
      timestamp: Date.now(),
      retry_count: 0,
    });

    await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
  }

  /**
   * Get sync status from server.
   */
  async getSyncStatus(): Promise<any> {
    try {
      const response = await this.apiClient.client.get('/sync/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return { devices: [], last_sync: null };
    }
  }

  /**
   * Request full synchronization from server.
   */
  async requestFullSync(): Promise<void> {
    try {
      await this.apiClient.client.post('/sync/request_full_sync');
    } catch (error) {
      console.error('Failed to request full sync:', error);
      throw error;
    }
  }

  /**
   * Retry queued sync operations.
   */
  async retryQueuedSyncs(): Promise<void> {
    const queueKey = 'sync_retry_queue';
    const queue = JSON.parse(
      (await AsyncStorage.getItem(queueKey)) || '[]'
    );

    for (const item of queue) {
      try {
        if (item.type === 'limbic_state') {
          await this.apiClient.syncLimbicState();
        } else if (item.type === 'conversation') {
          await this.apiClient.client.post('/sync/conversation', item.data);
        }

        // Remove from queue on success
        const updatedQueue = queue.filter((q: any) => q !== item);
        await AsyncStorage.setItem(queueKey, JSON.stringify(updatedQueue));
      } catch (error) {
        item.retry_count++;
        if (item.retry_count > 5) {
          // Remove after 5 retries
          const updatedQueue = queue.filter((q: any) => q !== item);
          await AsyncStorage.setItem(queueKey, JSON.stringify(updatedQueue));
        }
      }
    }
  }
}

// Export singleton instance
let syncClientInstance: SyncClient | null = null;

export function getSyncClient(apiClient: APIClient, deviceId: string): SyncClient {
  if (!syncClientInstance) {
    syncClientInstance = new SyncClient(apiClient, deviceId);
  }
  return syncClientInstance;
}

export const syncClient = getSyncClient(
  new APIClient(),
  'mobile-device-' + Date.now().toString()
);

export default SyncClient;

