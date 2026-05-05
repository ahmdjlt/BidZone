"use client";

import { use } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionDetailPageComponent from "@/components/auction/AuctionDetailPage";

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auctionId = Number(id);

  return (
    <>
      <Navbar />
      <AuctionDetailPageComponent auctionId={Number.isNaN(auctionId) ? 0 : auctionId} />
      <Footer />
    </>
  );
}
