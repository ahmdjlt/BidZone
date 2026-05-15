import { useQuery } from "@tanstack/react-query";
import { getBidsByAuction } from "@/lib/api/bids";

export function useBidHistory(auctionId: number | undefined) {
  return useQuery({
    queryKey: ["bids", auctionId],
    queryFn: () => getBidsByAuction(auctionId!),
    staleTime: 10_000,
    enabled: !!auctionId,
  });
}
