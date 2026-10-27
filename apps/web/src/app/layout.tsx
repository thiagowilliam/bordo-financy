import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bordo",
  description: "Diário financeiro de viagem",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
