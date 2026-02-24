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

  return (
    <>
      <Navbar />
      <AuctionDetailPageComponent />
      <Footer />
    </>
  );
}
