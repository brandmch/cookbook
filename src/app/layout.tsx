import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fam Cookbook",
  description: "A warm, collaborative family cookbook.",
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/mfr-app-icon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/mfr-app-icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/mfr-app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/mfr-app-icon-120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/mfr-app-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Caveat:wght@400;600;700&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;0,6..12,600;1,6..12,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
