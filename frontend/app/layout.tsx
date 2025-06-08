import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "../components/StoreProvider";
import { RecordsProvider } from "../context/records/RecordsContext";
import AuthLoader from "components/AuthLoader";

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
      <body className={` antialiased`}>
        <StoreProvider >
          <AuthLoader/>
          <RecordsProvider>{children}</RecordsProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
