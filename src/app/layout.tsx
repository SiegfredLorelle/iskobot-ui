import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Iskobot",
  description: "RAG enhanced chatbot for PUP",
  authors: [
    {name: "Siegfred Lorelle Mina", url: "#"},
    {name: "Geaus Caskie Fabro", url: "#"},
    {name: "Harold Amad", url: "#"},
    {name: "Angelo Miguel de Padua", url: "#"},
  ],
  keywords: "chatbot, pup, polytechnic university of the philippines, rag",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body
        className={"antialiased"}
      >
        <Providers>
          <Header/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
