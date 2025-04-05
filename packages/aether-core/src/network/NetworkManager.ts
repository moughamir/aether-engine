import { io, Socket } from 'socket.io-client';
import { MessageType, NetworkMessage } from '@aether/shared';
import EventEmitter from 'eventemitter3';

export interface NetworkOptions {
  url: string;
  autoConnect?: boolean;
  auth?: Record<string, any>;
}

export class NetworkManager extends EventEmitter {
  private socket: Socket | null = null;
  private options: NetworkOptions;
  private isConnected: boolean = false;

  constructor(options?: NetworkOptions) {
    super();

    this.options = options || {
      url: 'http://localhost:3000',
      autoConnect: false
    };

    if (this.options.autoConnect) {
      this.connect();
    }

    this.setupReconnect();
  }

  /**
   * Set the server URL for the socket connection
   * @param url The server URL
   */
  public setServerUrl(url: string): void {
    this.options.url = url;

    // If already connected, reconnect with new URL
    if (this.isConnected && this.socket) {
      this.socket.disconnect();
      this.connect();
    }
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      // Clean up old socket if it exists
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(this.options.url, {
        autoConnect: true,
        auth: this.options.auth
      });

      // Reattach all event listeners to the new socket
      this.reattachEventListeners();

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.emit('connected');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        this.emit('disconnected', reason);
      });

      this.socket.on('connect_error', (error) => {
        if (!this.isConnected) {
          reject(error);
        }
        this.emit('error', error);
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      // Remove all event listeners from the socket before disconnecting
      this.eventListeners.forEach((listeners, type) => {
        listeners.forEach(({ wrapper }) => {
          this.socket?.off(type, wrapper as any);
        });
      });

      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public send<T>(type: MessageType, data: T): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot send message: not connected');
      return;
    }

    const message: NetworkMessage<T> = {
      type,
      data,
      timestamp: Date.now()
    };

    this.socket.emit(type, message);
  }

  // Store event listeners to manage them when socket changes
  private eventListeners: Map<MessageType, Array<{ callback: Function; wrapper: Function }>> = new Map();

  public onMessage<T>(type: MessageType, callback: (data: T) => void): void {
    // Create wrapper function to pass only the data to the callback
    const wrapper = (message: NetworkMessage<T>) => {
      callback(message.data);
    };

    // Store the callback and its wrapper for later removal
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)?.push({ callback, wrapper });

    // Register with socket if available
    if (this.socket) {
      this.socket.on(type, wrapper);
    }
  }

  public offMessage(type: MessageType, callback?: Function): void {
    if (!this.eventListeners.has(type)) {
      return;
    }

    if (callback) {
      // Remove specific callback
      const listeners = this.eventListeners.get(type) || [];
      const matchingListeners = listeners.filter(listener => listener.callback === callback);

      matchingListeners.forEach(listener => {
        if (this.socket) {
          this.socket.off(type, listener.wrapper as any);
        }
      });

      // Update stored listeners
      this.eventListeners.set(
        type,
        listeners.filter(listener => listener.callback !== callback)
      );
    } else {
      // Remove all callbacks for this type
      const listeners = this.eventListeners.get(type) || [];
      if (this.socket) {
        listeners.forEach(listener => {
          this.socket?.off(type, listener.wrapper as any);
        });
      }
      this.eventListeners.delete(type);
    }
  }

  // Add connection state management
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private setupReconnect(): void {
    this.socket?.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.socket?.connect();
            this.reconnectAttempts++;
          }, 1000 * this.reconnectAttempts);
        }
      }
    });
  }

  /**
   * Reattaches all stored event listeners to the current socket
   * Called when a new socket is created
   */
  private reattachEventListeners(): void {
    if (!this.socket) return;

    // Iterate through all stored event types and their listeners
    this.eventListeners.forEach((listeners, type) => {
      listeners.forEach(({ wrapper }) => {
        // Attach each listener's wrapper function to the socket
        this.socket?.on(type, wrapper as any);
      });
    });
  }
}
