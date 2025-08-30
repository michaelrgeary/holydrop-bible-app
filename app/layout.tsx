import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import Header from "@/components/header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HolyDrop - KJV Bible with Annotations",
  description: "Read, annotate, and share the King James Bible - works offline!",
  manifest: "/manifest.json",
  themeColor: "#0EA5E9",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${crimsonText.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />
          <main className="pt-16 flex-1">
            {children}
          </main>
          <Footer />
          <OfflineIndicator />
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
