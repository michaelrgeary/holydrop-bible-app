"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  BookOpen, 
  Heart, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
}

const ListItem = ({ className, title, children, ...props }: ListItemProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};

export default function Header() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-blue-500" />
          </div>
          <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            HolyDrop
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Study</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/search"
                      >
                        <Search className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Smart Search
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Find any verse with AI-powered search that understands context and intent.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/reading-plans" title="Reading Plans">
                    Guided Bible reading plans from 30 days to full Bible coverage.
                  </ListItem>
                  <ListItem href="/genesis/1" title="Browse Books">
                    Explore all 66 books of the Bible with chapter navigation.
                  </ListItem>
                  <ListItem href="/help" title="Help Center">
                    Learn how to get the most out of HolyDrop's features.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Community</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/verse/john/3/16" title="Popular Verses">
                    Discover the most loved and shared verses from the community.
                  </ListItem>
                  <ListItem href="/collections" title="Collections">
                    Curated verse collections for different life situations.
                  </ListItem>
                  <ListItem href="/share" title="Share Verses">
                    Create beautiful verse cards to share on social media.
                  </ListItem>
                  <ListItem href="/feedback" title="Feedback">
                    Help us improve HolyDrop with your suggestions.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/search" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Search
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search verses..."
                className="pl-8 md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>

          {/* User Menu */}
          <nav className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.email?.split('@')[0] || 'user'}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/collections">
                      <Heart className="mr-2 h-4 w-4" />
                      My Collections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search verses..."
                className="pl-8"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="grid gap-2">
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/reading-plans">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Reading Plans
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/collections">
                  <Heart className="mr-2 h-4 w-4" />
                  Collections
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/help">
                  <Settings className="mr-2 h-4 w-4" />
                  Help
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}