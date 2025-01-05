import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme/provider";

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
    <html lang="en">

      <body
        className={"antialiased"}
      >
        <ThemeProvider>
          <Header/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
