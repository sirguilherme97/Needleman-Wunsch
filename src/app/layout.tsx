import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Needleman-Wunsch Algorithm",
  openGraph: {
    title: "Needleman-Wunsch Algorithm",
    description: "Explore o algoritmo de Needleman-Wunsch, uma poderosa técnica de alinhamento global de sequências amplamente utilizada em bioinformática e análise de sequências genéticas. Descubra como este algoritmo eficiente e flexível pode ser aplicado para comparar e encontrar similaridades entre sequências de DNA, RNA ou proteínas. Aprofunde-se neste método fundamental para entender a evolução molecular e a estrutura genética, e descubra suas aplicações em diversas áreas da ciência e da pesquisa biomédica.",
  },
  keywords:["Needleman-Wunsch","Needleman-Wunsch Algorithm", "Algorithm Needleman-Wunsch", "Alinhamento Sequencial Proteina", "Algorithm Alinhamento Sequencial", "Alinhamento Needleman-Wunsch"],
  description: "Explore o algoritmo de Needleman-Wunsch, uma poderosa técnica de alinhamento global de sequências amplamente utilizada em bioinformática e análise de sequências genéticas. Descubra como este algoritmo eficiente e flexível pode ser aplicado para comparar e encontrar similaridades entre sequências de DNA, RNA ou proteínas. Aprofunde-se neste método fundamental para entender a evolução molecular e a estrutura genética, e descubra suas aplicações em diversas áreas da ciência e da pesquisa biomédica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
