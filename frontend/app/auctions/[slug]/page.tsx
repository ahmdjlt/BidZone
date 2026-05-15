import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionDetailPageComponent from "@/components/auction/AuctionDetailPage";
import { getAuctionBySlug } from "@/lib/api/auctions";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const auction = await getAuctionBySlug(slug);
    return {
      title: `${auction.title} | BidZone`,
      description: auction.description?.slice(0, 160),
      openGraph: {
        title: `${auction.title} | BidZone`,
        description: auction.description?.slice(0, 160),
        images: auction.images?.[0]?.url ? [auction.images[0].url] : [],
      },
    };
  } catch {
    return { title: "Auction | BidZone" };
  }
}

export default async function AuctionDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug || slug.trim() === "") {
    notFound();
  }

  return (
    <>
      <Navbar />
      <AuctionDetailPageComponent slug={slug} />
      <Footer />
    </>
  );
}
