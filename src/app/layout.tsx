import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ClientBody } from "./ClientBody";
import { LiveChat } from "@/components/ui/live-chat"; // Fixed import path for LiveChat component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyntheticRights - Synthetic Media Rights Management",
  description: "Register, protect, license, and monetize your synthetic media rights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ClientBody>
            {children}
          </ClientBody>
          <Toaster />
          <SonnerToaster position="bottom-right" />
          <LiveChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
