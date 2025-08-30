import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import Header from "@/components/header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
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
  title: "holydrop - Where wisdom drops onto scripture",
  description: "Community-powered Bible annotations",
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
        </AuthProvider>
      </body>
    </html>
  );
}
