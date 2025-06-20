import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "Needleman-Wunsch Algorithm",
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  openGraph: {
    title: "Needleman-Wunsch Algorithm",
    description: "Explore the Needleman-Wunsch algorithm, a powerful global sequence alignment technique widely used in bioinformatics and genetic sequence analysis. Discover how this efficient and flexible algorithm can be applied to compare and find similarities between DNA, RNA, or protein sequences. Delve deeper into this fundamental method for understanding molecular evolution and genetic structure, and discover its applications in diverse areas of science and biomedical research.",
  },
  keywords:[
  // 🇧🇷 Brasil - Português
  "Needleman-Wunsch",
  "Algoritmo Needleman-Wunsch",
  "Alinhamento de Sequências Needleman-Wunsch",
  "Alinhamento de proteínas Needleman-Wunsch",
  "Algoritmo de bioinformática Needleman-Wunsch",
  "Needleman-Wunsch passo a passo",
  "Needleman-Wunsch em Python",
  "Needleman-Wunsch em C",
  "Needleman-Wunsch em JavaScript",

  // 🇺🇸 United States - English
  "Needleman-Wunsch Algorithm",
  "Needleman-Wunsch Sequence Alignment",
  "Needleman-Wunsch Protein Alignment",
  "Global Alignment Needleman-Wunsch",
  "Needleman-Wunsch Tutorial",
  "Needleman-Wunsch Python Implementation",
  "Needleman-Wunsch C++ Example",

  // 🇮🇳 India - English / Hindi
  "Needleman-Wunsch in Bioinformatics",
  "Needleman-Wunsch Algorithm in Hindi",
  "सीक्वेंस एलाइन्मेंट एल्गोरिद्म",
  "Needleman-Wunsch Python Hindi",
  "ग्लोबल एलाइन्मेंट एल्गोरिद्म",

  // 🇵🇱 Poland - Polish
  "Algorytm Needleman-Wunsch",
  "Needleman-Wunsch dopasowanie sekwencji",
  "Bioinformatyka Needleman-Wunsch",
  "Needleman-Wunsch krok po kroku",

  // 🇬🇷 Greece - Greek
  "Αλγόριθμος Needleman-Wunsch",
  "Στοίχιση ακολουθιών Needleman-Wunsch",
  "Needleman-Wunsch Βιοπληροφορική",

  // 🇰🇷 South Korea - Korean
  "니들먼-운쉬 알고리즘",
  "Needleman-Wunsch 서열 정렬",
  "바이오인포매틱스 정렬 알고리즘",

  // 🇹🇷 Türkiye - Turkish
  "Needleman-Wunsch algoritması",
  "Biyoinformatik sıralama algoritması",
  "Protein hizalama algoritması",

  // 🇫🇷 France - French
  "Algorithme Needleman-Wunsch",
  "Alignement de séquences biologiques",
  "Needleman-Wunsch Bioinformatique",

  // 🇮🇷 Iran - Persian
  "الگوریتم نیدلمن-وانش",
  "هم‌ترازی توالی‌ها نیدلمن-وانش",

  // 🇦🇷 Argentina / 🇵🇹 Portugal - Spanish / Portuguese
  "Algoritmo de alineación Needleman-Wunsch",
  "Alineamiento de secuencias Needleman-Wunsch",
  "Algoritmo Needleman-Wunsch Portugal",

  // 🇩🇪 Germany - German
  "Needleman-Wunsch Algorithmus",
  "Sequenzalignment Needleman-Wunsch",

  // 🇮🇩 Indonesia - Indonesian
  "Algoritma Needleman-Wunsch",
  "Penyelarasan urutan biologis Needleman-Wunsch",

  // 🇳🇬 Nigeria / 🇵🇰 Pakistan / 🇪🇬 Egypt / others - English/Arabic mix
  "Needleman-Wunsch Algorithm Explained",
  "تحليل Needleman-Wunsch",
  "Needleman-Wunsch التوافق الجيني"
],

  description: "Explore the Needleman-Wunsch algorithm, a powerful global sequence alignment technique widely used in bioinformatics and genetic sequence analysis. Discover how this efficient and flexible algorithm can be applied to compare and find similarities between DNA, RNA, or protein sequences. Delve deeper into this fundamental method for understanding molecular evolution and genetic structure, and discover its applications in diverse areas of science and biomedical research.",
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
        <link rel="icon" href="/favicon.ico" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2325936665567762" crossOrigin="anonymous"></script>
      </head>
      <Analytics />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
