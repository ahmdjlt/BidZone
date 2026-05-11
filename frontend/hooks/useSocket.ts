"use client";

import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, subscribeToAuction, unsubscribeFromAuction } from "@/lib/socket";
import { useBidStore } from "@/store/bidStore";
import type { Bid } from "@/types/bid";

export function useSocket(auctionId?: string | number) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBid, setLastBid] = useState<Bid | null>(null);
  const addBid = useBidStore((s) => s.addBid);

  useEffect(() => {
    if (!auctionId) return;

    const socket = connectSocket();

    function onConnect() {
      setIsConnected(true);
      subscribeToAuction(auctionId!);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNewBid(bid: Bid) {
      setLastBid(bid);
      addBid(bid);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-bid", onNewBid);

    if (socket.connected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsConnected(true);
      subscribeToAuction(auctionId);
    }

    return () => {
      unsubscribeFromAuction(auctionId!);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-bid", onNewBid);
      disconnectSocket();
    };
  }, [auctionId, addBid]);

  return { isConnected, lastBid };
}
