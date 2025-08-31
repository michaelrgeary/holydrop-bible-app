import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Search, Users, Heart } from "lucide-react";

export default function Home() {
  const popularBooks = [
    { name: "Genesis", description: "The Beginning", chapter: 1, url: "/genesis/1" },
    { name: "Psalms", description: "Songs and Poetry", chapter: 23, url: "/psalms/23" },
    { name: "Matthew", description: "Life of Jesus", chapter: 5, url: "/matthew/5" },
    { name: "John", description: "Gospel of Love", chapter: 3, url: "/john/3" },
    { name: "Romans", description: "Christian Doctrine", chapter: 8, url: "/romans/8" },
    { name: "Revelation", description: "The End Times", chapter: 1, url: "/revelation/1" },
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Hero Section - Simple centered text */}
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold tracking-tight">HolyDrop</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Community-powered Bible annotations
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/genesis/1">Start Reading</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/search">Search Verses</Link>
          </Button>
        </div>
      </div>

      {/* Features - Simple cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <Search className="h-8 w-8 mb-2" />
            <CardTitle>Smart Search</CardTitle>
            <CardDescription>
              Find any verse quickly with our powerful search
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 mb-2" />
            <CardTitle>Community Notes</CardTitle>
            <CardDescription>
              Add and view annotations from the community
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <Heart className="h-8 w-8 mb-2" />
            <CardTitle>Reading Plans</CardTitle>
            <CardDescription>
              Follow structured Bible reading plans
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Access Books */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Popular Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularBooks.map((book) => (
            <Card key={book.name}>
              <CardHeader>
                <CardTitle>{book.name}</CardTitle>
                <CardDescription>{book.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href={book.url}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read Chapter {book.chapter}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}