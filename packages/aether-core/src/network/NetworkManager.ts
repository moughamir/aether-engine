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
  }
  
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }
      
      this.socket = io(this.options.url, {
        autoConnect: true,
        auth: this.options.auth
      });
      
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
  
  public on<T>(type: MessageType, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(type, (message: NetworkMessage<T>) => {
        callback(message.data);
      });
    }
  }
  
  public off(type: MessageType): void {
    if (this.socket) {
      this.socket.off(type);
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
}