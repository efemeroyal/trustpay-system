type WsEventType =
  | "mint_complete"
  | "payment_confirmed"
  | "tx_failed"
  | "receipt_validated"
  | "receipt_rejected"
  | "ping";
interface WsMessage {
  type: WsEventType;
  payload: Record<string, unknown>;
}
type Listener = (payload: Record<string, unknown>) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners = new Map<WsEventType, Set<Listener>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  private shouldReconnect = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.shouldReconnect = true;
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onmessage = (e) => this.handleMessage(e);
      this.ws.onclose = () => {
        if (this.shouldReconnect) this.scheduleReconnect();
      };
      this.ws.onerror = () => {};
    } catch {
      this.scheduleReconnect();
    }
  }

  private handleMessage(e: MessageEvent) {
    try {
      const msg: WsMessage = JSON.parse(e.data);
      this.listeners.get(msg.type)?.forEach((fn) => fn(msg.payload));
    } catch {}
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  on(type: WsEventType, fn: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
    return () => this.listeners.get(type)?.delete(fn);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export const wsManager = new WebSocketManager(
  import.meta.env.VITE_WS_URL ?? "ws://localhost:5000",
);
