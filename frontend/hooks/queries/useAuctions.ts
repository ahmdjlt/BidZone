import { useQuery } from "@tanstack/react-query";
import { getAuctions, type AuctionFilters } from "@/lib/api/auctions";

export function useAuctions(filters?: AuctionFilters) {
  return useQuery({
    queryKey: ["auctions", filters],
    queryFn: () => getAuctions(filters),
    staleTime: 60_000,
  });
}
