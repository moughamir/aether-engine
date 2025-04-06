import { io, Socket } from "socket.io-client";
import {
  ErrorType,
  MessageType,
  NetworkMessage,
  tryCatchAsync,
  type Lifecycle,
} from "@aether/shared";
import EventEmitter from "eventemitter3";

import { EventRegistry } from "./eventRegistry";
import { ResourcePool } from "./resourcePool";
import type { NetworkOptions } from "./types";

// Add a message buffer for offline scenarios
export class MessageBuffer<T> {
  private messages: Array<{ type: MessageType; data: T }> = [];
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  add(type: MessageType, data: T): void {
    this.messages.push({ type, data });
    if (this.messages.length > this.maxSize) {
      this.messages.shift();
    }
  }

  flush(sendFn: (type: MessageType, data: T) => void): void {
    this.messages.forEach(({ type, data }) => sendFn(type, data));
    this.clear();
  }

  clear(): void {
    this.messages = [];
  }
}

export class NetworkManager extends EventEmitter implements Lifecycle {
  private socket: Socket | null = null;
  private options: NetworkOptions;
  private isConnected: boolean = false;
  private eventRegistry = new EventRegistry();
  private reconnectAttempts = 0;
  private messageBuffer?: MessageBuffer<any>;

  constructor(options?: NetworkOptions) {
    super();

    this.options = options || {
      url: "http://localhost:3000",
      autoConnect: false,
    };

    if (this.options.autoConnect) {
      this.connect();
    }

    this.setupReconnect();

    // Initialize message buffer if enabled
    if (options?.messageBuffering?.enabled) {
      this.messageBuffer = new MessageBuffer(
        options.messageBuffering.maxSize || 100
      );
    }
  }

  public setServerUrl(url: string): void {
    this.options.url = url;

    // If already connected, reconnect with new URL
    if (this.isConnected && this.socket) {
      this.socket.disconnect();
      this.connect();
    }
  }

  public async start(): Promise<void> {
    return this.connect();
  }

  public async connect(): Promise<void> {
    const result = await tryCatchAsync(
      async () => {
        if (this.isConnected) return;

        // Clean up old socket if it exists
        if (this.socket) {
          this.socket.disconnect();
        }

        return new Promise<void>((resolve, reject) => {
          this.socket = io(this.options.url, {
            autoConnect: true,
            auth: this.options.auth,
          });

          // Reattach all event listeners to the new socket
          this.reattachEventListeners();

          // Add this after successful connection:
          this.socket.on("connect", () => {
            this.isConnected = true;
            this.emit("connected");
            this.flushMessageBuffer();
            resolve();
          });

          this.socket.on("disconnect", (reason) => {
            this.isConnected = false;
            this.emit("disconnected", reason);
          });

          this.socket.on("connect_error", (error) => {
            if (!this.isConnected) {
              reject(error);
            }
            this.emit("error", error);
          });
        });
      },
      ErrorType.NETWORK,
      "Failed to connect to server"
    );

    if (!result.success) throw result.error;
  }

  public stop(): void {
    this.disconnect();
  }

  public disconnect(): void {
    if (this.socket) {
      this.eventRegistry.remove("*", undefined, (type, wrapper) =>
        this.socket?.off(type, wrapper as any)
      );

      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public send<T>(type: MessageType, data: T): void {
    if (!this.socket || !this.isConnected) {
      if (this.messageBuffer) {
        this.messageBuffer.add(type, data);
        return;
      }
      console.warn("Cannot send message: not connected");
      return;
    }

    // Use resource pool for message object to reduce GC pressure
    const message = ResourcePool.acquire<NetworkMessage<T>>("NetworkMessage");
    message.type = type;
    message.data = data;
    message.timestamp = Date.now();

    this.socket.emit(type, message);

    // Update statistics
    this.stats.messagesSent++;
    this.stats.bytesTransferred += JSON.stringify(message).length;

    // Return message to pool after sending
    ResourcePool.release("NetworkMessage", message);
  }

  // Add method to flush buffered messages
  private flushMessageBuffer(): void {
    if (this.messageBuffer && this.isConnected) {
      this.messageBuffer.flush((type, data) => this.send(type, data));
    }
  }

  public onMessage<T>(type: MessageType, callback: (data: T) => void): void {
    this.eventRegistry.add(type.toString(), callback, (t, wrapper) =>
      this.socket?.on(t, wrapper as any)
    );
  }

  public offMessage(type: MessageType, callback?: Function): void {
    this.eventRegistry.remove(type.toString(), callback, (t, wrapper) =>
      this.socket?.off(t, wrapper as any)
    );
  }

  private setupReconnect(): void {
    const maxAttempts = this.options.reconnect?.maxAttempts ?? 5;
    const baseDelay = this.options.reconnect?.baseDelay ?? 1000;

    this.socket?.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        if (this.reconnectAttempts < maxAttempts) {
          setTimeout(() => {
            this.socket?.connect();
            this.reconnectAttempts++;
          }, baseDelay * this.reconnectAttempts);
        }
      }
    });
  }

  private reattachEventListeners(): void {
    if (!this.socket) return;
    this.eventRegistry.reattachAll((type, wrapper) =>
      this.socket?.on(type, wrapper as any)
    );
  }

  public dispose(): void {
    this.disconnect();
    this.removeAllListeners();
  }

  // Add network statistics
  private stats = {
    messagesSent: 0,
    messagesReceived: 0,
    bytesTransferred: 0,
    lastLatency: 0,
  };

  public getStats(): Readonly<typeof this.stats> {
    return this.stats;
  }

  // Add ping method to measure latency
  public ping(): Promise<number> {
    return new Promise((resolve) => {
      if (!this.isConnected) {
        resolve(-1);
        return;
      }

      const start = performance.now();
      this.socket!.emit("ping", () => {
        const latency = performance.now() - start;
        this.stats.lastLatency = latency;
        resolve(latency);
      });
    });
  }
}
