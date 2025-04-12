import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON Visualizer",
  description: "Visualize, search, and explore JSON data",
  keywords: [
    "JSON",
    "Visualizer",
    "Search",
    "Explore",
    "JSON Data",
    "JSON Visualization",
    "JSON Search",
    "JSON Exploration",
    "JSON Data Visualization",
    "JSON Data Search",
    "JSON Data Exploration",
  ],
  openGraph: {
    title: "JSON Visualizer",
    description: "Visualize, search, and explore JSON data",
    url: "",
    siteName: "JSON Visualizer",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/assets/icons/favicon.svg" />
      </head>
      <body className="max-w-screen-xl p-4 mx-auto bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
