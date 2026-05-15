import { useQuery } from "@tanstack/react-query";
import { getAuctionBySlug } from "@/lib/api/auctions";

export function useAuction(slug: string) {
  return useQuery({
    queryKey: ["auction", slug],
    queryFn: () => getAuctionBySlug(slug),
    staleTime: 30_000,
    enabled: !!slug,
  });
}
