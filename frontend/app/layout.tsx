import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import AuthBootstrapper from "@/components/auth/AuthBootstrapper";
import ThemeProvider from "@/components/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BidZone | Live Auction Marketplace",
  description:
    "BidZone helps buyers discover live auctions and sellers launch listings with real-time competition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${dmSerif.variable} antialiased`}>
        <QueryProvider>
          <ErrorBoundary>
            <ThemeProvider>
              <AuthBootstrapper />
              {children}
            </ThemeProvider>
          </ErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
