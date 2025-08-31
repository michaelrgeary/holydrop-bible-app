import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Menu, BookOpen, Search, Home, Settings, User } from "lucide-react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HolyDrop - Bible Reading",
  description: "Community-powered Bible annotations",
  manifest: "/manifest.json",
};

function Sidebar() {
  const books = [
    { name: "Genesis", url: "/genesis/1" },
    { name: "Exodus", url: "/exodus/1" },
    { name: "Matthew", url: "/matthew/1" },
    { name: "John", url: "/john/1" },
    { name: "Romans", url: "/romans/1" },
    { name: "Revelation", url: "/revelation/1" },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold">HolyDrop</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/reading-plans">
                <BookOpen className="mr-2 h-4 w-4" />
                Reading Plans
              </Link>
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Quick Access</h2>
          <div className="space-y-1">
            {books.map((book) => (
              <Button key={book.name} variant="ghost" className="w-full justify-start" asChild>
                <Link href={book.url}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {book.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/profile/user">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="flex h-screen">
            {/* Desktop Sidebar */}
            <Sidebar />
            
            {/* Mobile Header */}
            <div className="flex flex-1 flex-col">
              <header className="flex h-14 items-center border-b px-4 md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">HolyDrop</h1>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-5rem)]">
                      <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
                        <div className="space-y-1">
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/">
                              <Home className="mr-2 h-4 w-4" />
                              Home
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/search">
                              <Search className="mr-2 h-4 w-4" />
                              Search
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/reading-plans">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Reading Plans
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold">Quick Access</h2>
                        <div className="space-y-1">
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/genesis/1">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Genesis
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/john/1">
                              <BookOpen className="mr-2 h-4 w-4" />
                              John
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/romans/1">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Romans
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                
                <h1 className="ml-4 text-lg font-semibold">HolyDrop</h1>
              </header>
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
          
          <OfflineIndicator />
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}