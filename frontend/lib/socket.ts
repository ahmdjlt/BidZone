import type { Bid } from "@/types/bid";
import { getApiBase } from "@/lib/api/client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || getApiBase();

type SocketEvent = "connect" | "disconnect" | "new-bid";

class AuctionSocket {
  private ws: WebSocket | null = null;
  private auctionId: string | number | null = null;
  private handlers = {
    connect: new Set<() => void>(),
    disconnect: new Set<() => void>(),
    "new-bid": new Set<(bid: Bid) => void>(),
  };

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  on(event: "connect" | "disconnect", handler: () => void): void;
  on(event: "new-bid", handler: (bid: Bid) => void): void;
  on(event: SocketEvent, handler: (() => void) | ((bid: Bid) => void)): void {
    if (event === "new-bid") {
      this.handlers[event].add(handler as (bid: Bid) => void);
      return;
    }

    this.handlers[event].add(handler as () => void);
  }

  off(event: "connect" | "disconnect", handler: () => void): void;
  off(event: "new-bid", handler: (bid: Bid) => void): void;
  off(event: SocketEvent, handler: (() => void) | ((bid: Bid) => void)): void {
    if (event === "new-bid") {
      this.handlers[event].delete(handler as (bid: Bid) => void);
      return;
    }

    this.handlers[event].delete(handler as () => void);
  }

  emit(event: "join-auction" | "leave-auction", auctionId: string | number): void {
    if (event === "join-auction") {
      this.connect(auctionId);
      return;
    }

    if (this.auctionId === auctionId) {
      this.disconnect();
    }
  }

  connect(auctionId: string | number): void {
    if (this.connected && this.auctionId === auctionId) return;

    this.disconnect();
    this.auctionId = auctionId;

    const url = new URL(`/ws/auctions/${auctionId}`, SOCKET_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    this.ws = new WebSocket(url);
    this.ws.addEventListener("open", () => this.dispatchConnectionEvent("connect"));
    this.ws.addEventListener("close", () => this.dispatchConnectionEvent("disconnect"));
    this.ws.addEventListener("error", () => this.dispatchConnectionEvent("disconnect"));
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as { type?: SocketEvent; bid?: Bid };
      if (message.type === "new-bid") {
        this.dispatchBid(message.bid);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.auctionId = null;
  }

  private dispatchConnectionEvent(event: "connect" | "disconnect"): void {
    this.handlers[event].forEach((handler) => handler());
  }

  private dispatchBid(bid?: Bid): void {
    if (!bid) {
      return;
    }

    this.handlers["new-bid"].forEach((handler) => handler(bid));
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
