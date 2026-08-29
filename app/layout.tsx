import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "OviZero | Vector-climate intelligence",
  description: "Block-level Aedes risk intelligence for earlier, targeted response.",
  openGraph: {
    title: "OviZero | See risk. Act earlier.",
    description: "Block-level Aedes risk intelligence for earlier, targeted response.",
    images: [{ url: "/og.png", width: 1792, height: 934, alt: "OviZero block-level risk map" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OviZero | See risk. Act earlier.",
    description: "Block-level Aedes risk intelligence for earlier, targeted response.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
