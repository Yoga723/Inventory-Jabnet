import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventory Jabnet",
  description: "Inventory Jabnet",
  keywords: "Inventory, Jabnet",
  authors: [{ name: "Yoga Pangestu" }],
  openGraph: {
    title: "Inventory Jabnet",
    description: "Inventory Jabnet",
    url: "https://inventory.jabnet.id",
    countryName: "id",
    siteName: "Inventory Jabnet",
    images: [{ url: "/images/jabnet-logo.webp" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jabnet.id",
    title: "Inventory Jabnet",
    description: "Inventory Jabnet",
    images: ["/images/jabnet-logo.webp"],
  },
  icons: {
    icon: "/images/jabnet-logo.webp",
    apple: "/images/jabnet-logo.webp",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` antialiased`}>{children}</body>
    </html>
  );
}
