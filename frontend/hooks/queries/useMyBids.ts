import { useQuery } from "@tanstack/react-query";
import { getMyBids } from "@/lib/api/bids";

export function useMyBids(enabled = true) {
  return useQuery({
    queryKey: ["myBids"],
    queryFn: getMyBids,
    staleTime: 30_000,
    enabled,
  });
}
