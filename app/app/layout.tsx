import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yapper Voice",
  description: "Talk to AI friends who are always available. Brainstorm, vent, or just chat — on demand.",
  metadataBase: new URL("https://yappervoice.com"),
  openGraph: {
    title: "Yapper Voice",
    description: "Talk to AI friends who are always available.",
    url: "https://yappervoice.com",
    siteName: "Yapper Voice",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
