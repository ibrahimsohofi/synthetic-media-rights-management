import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import ClientBody from "./ClientBody";
import { LiveChat } from "@/components/ui/live-chat"; // Fixed import path for LiveChat component
import { I18nProvider } from "@/components/i18n-provider"; // Import I18nProvider instead

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synthetic Media Rights Management Platform",
  description: "Protect and manage rights for AI-generated and synthetic media content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <I18nProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ClientBody>
              {children}
              <LiveChat />
            </ClientBody>
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
