// Realtime Synchronization Service for Verifix
// Supports Supabase Realtime Channels with local BroadcastChannel & EventTarget fallback
import { supabase, isSupabaseConfigured } from './supabaseClient';

class RealtimeSyncService {
  constructor() {
    this.listeners = new Map();
    this.broadcastChannel = null;

    // Initialize cross-tab BroadcastChannel if supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('verifix_realtime_bus');
        this.broadcastChannel.onmessage = (event) => {
          const { eventType, payload } = event.data || {};
          this.notifyLocalListeners(eventType, payload);
        };
      } catch (err) {
        console.warn('BroadcastChannel not initialized', err);
      }
    }

    // Initialize Supabase Realtime channel if credentials configured
    if (isSupabaseConfigured && supabase) {
      try {
        this.supabaseChannel = supabase
          .channel('verifix_realtime_jobs')
          .on('broadcast', { event: 'job_event' }, ({ payload }) => {
            const { eventType, data } = payload || {};
            this.notifyLocalListeners(eventType, data);
          })
          .subscribe((status) => {
            console.info(`[RealtimeSync] Supabase Channel status: ${status}`);
          });
      } catch (err) {
        console.warn('Supabase Realtime subscription error', err);
      }
    }
  }

  // Subscribe to specific event types
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Broadcast event across tabs and to Supabase
  broadcast(eventType, payload) {
    // 1. Notify local subscribers in the current tab
    this.notifyLocalListeners(eventType, payload);

    // 2. Broadcast to other open browser tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ eventType, payload });
      } catch (err) {
        console.warn('BroadcastChannel postMessage error', err);
      }
    }

    // 3. Broadcast to Supabase Realtime if active
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'job_event',
          payload: { eventType, data: payload }
        });
      } catch (err) {
        console.warn('Supabase Realtime broadcast error', err);
      }
    }
  }

  notifyLocalListeners(eventType, payload) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in listener for ${eventType}`, e);
        }
      });
    }

    // Also notify wildcard listeners
    const wildcardCallbacks = this.listeners.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((cb) => {
        try {
          cb(eventType, payload);
        } catch (e) {
          console.error(`Error in wildcard listener`, e);
        }
      });
    }
  }
}

export const realtimeSync = new RealtimeSyncService();
