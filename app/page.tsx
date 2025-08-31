import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  Heart, 
  Share2, 
  Download, 
  Zap, 
  Users, 
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        
        <div className="container relative mx-auto max-w-6xl text-center">
          {/* Hero Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Now with AI-powered search & offline support
          </Badge>

          {/* Main Heading */}
          <h1 className="mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl">
            Dive Deep Into
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">
              God's Word
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 md:text-xl">
            Experience the Bible like never before with HolyDrop. Smart search, beautiful verse cards, 
            reading plans, and a thriving community—all working offline.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="group px-8">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Start Exploring
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/reading-plans">
                <BookOpen className="mr-2 h-4 w-4" />
                Reading Plans
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">31K+</div>
              <div className="text-sm text-slate-600">Bible Verses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">1,189</div>
              <div className="text-sm text-slate-600">Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">66</div>
              <div className="text-sm text-slate-600">Books</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">100%</div>
              <div className="text-sm text-slate-600">Offline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Find Any Verse Instantly
                </h2>
                <p className="text-slate-600">
                  Search by reference, topic, or keywords
                </p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Try 'John 3:16', 'love', or 'peace'..." 
                  className="pl-10 py-6 text-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button className="absolute right-2 top-2" size="sm">
                  Search
                </Button>
              </div>

              {/* Popular searches */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Love</Badge>
                <Badge variant="secondary">Peace</Badge>
                <Badge variant="secondary">Faith</Badge>
                <Badge variant="secondary">Hope</Badge>
                <Badge variant="secondary">John 3:16</Badge>
                <Badge variant="secondary">Psalm 23</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-slate-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need for Bible Study
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful tools designed to help you dive deeper into Scripture and share your discoveries.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Smart Search */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Smart Search</CardTitle>
                <CardDescription>
                  AI-powered search that understands context, finds related verses, and corrects typos automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Beautiful Cards */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="h-6 w-6 text-cyan-600" />
                </div>
                <CardTitle>Verse Cards</CardTitle>
                <CardDescription>
                  Create stunning verse cards with beautiful themes. Perfect for Instagram, Twitter, or printing.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Reading Plans */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Reading Plans</CardTitle>
                <CardDescription>
                  Guided reading plans from 30-day challenges to full Bible reading with daily progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Offline First */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Offline First</CardTitle>
                <CardDescription>
                  Complete Bible and all features work offline. Install as a mobile app for the best experience.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Community */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Connect with other believers, share insights, and discover popular verses from the community.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Privacy Focused */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  Your Bible study is personal. We collect minimal data and everything works locally on your device.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Verses Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Most Loved Verses
            </h2>
            <p className="text-lg text-slate-600">
              Discover the verses that inspire millions around the world
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Star className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <Badge variant="outline" className="text-xs">John 3:16</Badge>
                  </div>
                </div>
                <blockquote className="text-lg text-slate-700 italic mb-4">
                  "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
                </blockquote>
                <Button asChild variant="outline" size="sm">
                  <Link href="/verse/john/3/16">
                    Read More
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Star className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <Badge variant="outline" className="text-xs">Philippians 4:13</Badge>
                  </div>
                </div>
                <blockquote className="text-lg text-slate-700 italic mb-4">
                  "I can do all this through him who gives me strength."
                </blockquote>
                <Button asChild variant="outline" size="sm">
                  <Link href="/verse/philippians/4/13">
                    Read More
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Dive Deeper?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of believers who are discovering new depths in Scripture every day.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="px-8">
              <Link href="/search">
                Start Your Journey
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white/10">
              <Link href="/help">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}