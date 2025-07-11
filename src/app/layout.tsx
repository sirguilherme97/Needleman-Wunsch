import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
import { Analytics } from "@vercel/analytics/react"
import AdSenseScript from "../components/AdSenseScript";

export const metadata: Metadata = {
  title: "Needleman-Wunsch Algorithm - Sequence Alignment Tool",
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  openGraph: {
    title: "Needleman-Wunsch Algorithm - Sequence Alignment Tool",
    description: "Professional bioinformatics tool for global sequence alignment. Compare DNA, RNA, and protein sequences using the Needleman-Wunsch algorithm. Free online tool for researchers and students.",
  },
  keywords: ["Needleman-Wunsch", "sequence alignment", "bioinformatics", "DNA alignment", "protein alignment", "global alignment", "algorithm", "bioinformatics tools", "molecular biology", "computational biology"],
  description: "Professional bioinformatics tool for global sequence alignment. Compare DNA, RNA, and protein sequences using the Needleman-Wunsch algorithm. Free online tool for researchers and students in molecular biology and computational biology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-2325936665567762" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" crossOrigin="anonymous"></script>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="RGB Logic" />
      </head>
      <body className={inter.className}>
        <AdSenseScript />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
