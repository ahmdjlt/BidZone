import type { Bid } from "@/types/bid";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5171";

type SocketEvent = "connect" | "disconnect" | "connecting" | "connection_failed" | "new-bid";

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30_000;

class AuctionSocket {
  private ws: WebSocket | null = null;
  private auctionId: string | number | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalDisconnect = false;

  private handlers = {
    connect: new Set<() => void>(),
    disconnect: new Set<() => void>(),
    connecting: new Set<() => void>(),
    connection_failed: new Set<() => void>(),
    "new-bid": new Set<(bid: Bid) => void>(),
  };

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  on(event: "connect" | "disconnect" | "connecting" | "connection_failed", handler: () => void): void;
  on(event: "new-bid", handler: (bid: Bid) => void): void;
  on(event: SocketEvent, handler: (() => void) | ((bid: Bid) => void)): void {
    if (event === "new-bid") {
      this.handlers[event].add(handler as (bid: Bid) => void);
    } else {
      this.handlers[event].add(handler as () => void);
    }
  }

  off(event: "connect" | "disconnect" | "connecting" | "connection_failed", handler: () => void): void;
  off(event: "new-bid", handler: (bid: Bid) => void): void;
  off(event: SocketEvent, handler: (() => void) | ((bid: Bid) => void)): void {
    if (event === "new-bid") {
      this.handlers[event].delete(handler as (bid: Bid) => void);
    } else {
      this.handlers[event].delete(handler as () => void);
    }
  }

  emit(event: "join-auction" | "leave-auction", auctionId: string | number): void {
    if (event === "join-auction") {
      this.connect(auctionId);
    } else if (this.auctionId === auctionId) {
      this.disconnect();
    }
  }

  connect(auctionId: string | number): void {
    if (this.connected && this.auctionId === auctionId) return;
    this.clearReconnectTimeout();
    this.isIntentionalDisconnect = false;
    this.reconnectAttempts = 0;
    this.auctionId = auctionId;
    this.openWebSocket(auctionId);
  }

  disconnect(): void {
    this.isIntentionalDisconnect = true;
    this.clearReconnectTimeout();
    this.closeWebSocket();
    this.auctionId = null;
    this.reconnectAttempts = 0;
  }

  private openWebSocket(auctionId: string | number): void {
    this.closeWebSocket();
    this.dispatch("connecting");

    const url = new URL(`/ws/auctions/${auctionId}`, SOCKET_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    this.ws = new WebSocket(url);

    this.ws.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.dispatch("connect");
    });

    this.ws.addEventListener("close", () => {
      this.dispatch("disconnect");
      if (!this.isIntentionalDisconnect && this.auctionId != null) {
        this.scheduleReconnect(this.auctionId);
      }
    });

    this.ws.addEventListener("error", () => {
      // close event fires after error; reconnect is handled there
    });

    this.ws.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data as string) as { type?: string; bid?: Bid };
        if (message.type === "new-bid" && message.bid) {
          this.handlers["new-bid"].forEach((h) => h(message.bid!));
        }
      } catch {
        // ignore malformed messages
      }
    });
  }

  private scheduleReconnect(auctionId: string | number): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.dispatch("connection_failed");
      return;
    }

    const delay = Math.min(BASE_DELAY_MS * 2 ** this.reconnectAttempts, MAX_DELAY_MS);
    this.reconnectAttempts += 1;

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isIntentionalDisconnect) {
        this.openWebSocket(auctionId);
      }
    }, delay);
  }

  private closeWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout != null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private dispatch(event: "connect" | "disconnect" | "connecting" | "connection_failed"): void {
    this.handlers[event].forEach((h) => h());
  }
}

let socket: AuctionSocket | null = null;

export function connectSocket(): AuctionSocket {
  socket ??= new AuctionSocket();
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): AuctionSocket | null {
  return socket;
}

export function subscribeToAuction(auctionId: string | number): void {
  const s = socket ?? connectSocket();
  s.emit("join-auction", auctionId);
}

export function unsubscribeFromAuction(auctionId: string | number): void {
  socket?.emit("leave-auction", auctionId);
}
