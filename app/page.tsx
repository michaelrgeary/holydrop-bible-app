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
  Sparkles,
  Droplets,
  ChevronDown
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden section-padding bg-gradient-to-br from-water-50 via-water-100/30 to-cyan-50">
        {/* Animated Water Drop Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-20 w-96 h-96 bg-water-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-32 w-128 h-128 bg-water-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-holy-200/20 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="container-width relative">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Droplets className="h-12 w-12 md:h-16 md:w-16 text-water-500 animate-water-drop" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs md:text-sm">H</span>
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold">
                  <span className="text-gradient-holy">HolyDrop</span>
                </h1>
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-holy-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Hero Badge */}
          <div className="text-center mb-6 animate-slide-down" style={{ animationDelay: "0.1s" }}>
            <Badge className="glass-morphism px-4 py-2 text-sm border-white/20">
              <Sparkles className="mr-2 h-4 w-4 text-holy-400" />
              AI-powered search • Works offline • Beautiful verse cards
            </Badge>
          </div>

          {/* Main Heading */}
          <h2 className="text-center mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-deep-ocean">
              Dive Deep Into
            </span>
            <br />
            <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-gradient">
              God's Word
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-center mx-auto mb-10 max-w-2xl text-lg md:text-xl text-text-secondary animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Experience the Bible like never before. Smart search, beautiful verse cards, 
            reading plans, and a thriving community—all working offline.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-16 animate-scale-up" style={{ animationDelay: "0.4s" }}>
            <Button asChild className="btn-holy group">
              <Link href="/search">
                <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild className="btn-glass border-water-300/50 hover:border-water-400/70">
              <Link href="/reading-plans">
                <BookOpen className="mr-2 h-5 w-5" />
                Reading Plans
              </Link>
            </Button>
          </div>

          {/* Stats with Glass Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="glass-morphism rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-water-600">31K+</div>
              <div className="text-sm text-text-secondary mt-1">Bible Verses</div>
            </div>
            <div className="glass-morphism rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-water-600">1,189</div>
              <div className="text-sm text-text-secondary mt-1">Chapters</div>
            </div>
            <div className="glass-morphism rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-water-600">66</div>
              <div className="text-sm text-text-secondary mt-1">Books</div>
            </div>
            <div className="glass-morphism rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-water-600">100%</div>
              <div className="text-sm text-text-secondary mt-1">Offline</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-12 animate-bounce-gentle">
            <ChevronDown className="h-6 w-6 text-water-400" />
          </div>
        </div>
      </section>

      {/* Quick Search Section with Glass Effect */}
      <section className="section-padding relative">
        <div className="container-width">
          <Card className="glass-morphism border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
                  Find Any Verse Instantly
                </h2>
                <p className="text-lg text-text-secondary">
                  AI-powered search that understands context and intent
                </p>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-water-400 to-cyan-400 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-water-500" />
                  <Input 
                    placeholder="Try 'John 3:16', 'love', or 'peace'..." 
                    className="pl-12 pr-28 py-6 text-lg bg-white/90 border-water-200 focus:border-water-400 focus:ring-water-400 rounded-xl"
                  />
                  <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-water-500 to-cyan-500 hover:from-water-600 hover:to-cyan-600">
                    Search
                  </Button>
                </div>
              </div>

              {/* Popular searches with hover effects */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {["Love", "Peace", "Faith", "Hope", "John 3:16", "Psalm 23"].map((term) => (
                  <Badge 
                    key={term}
                    className="glass-morphism px-4 py-2 hover:scale-110 hover:shadow-lg transition-all cursor-pointer border-water-200/50"
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section with Glass Morphism Cards */}
      <section className="section-padding bg-gradient-to-b from-water-50/50 to-transparent">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need for Bible Study
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Powerful tools designed to help you dive deeper into Scripture and share your discoveries.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Smart Search Card */}
            <Card className="glass-morphism border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-water-400 to-cyan-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Search</CardTitle>
                <CardDescription className="text-base">
                  AI-powered search that understands context, finds related verses, and corrects typos automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Beautiful Cards */}
            <Card className="glass-morphism border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-water-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Share2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Verse Cards</CardTitle>
                <CardDescription className="text-base">
                  Create stunning verse cards with beautiful themes. Perfect for Instagram, Twitter, or printing.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Reading Plans */}
            <Card className="glass-morphism border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Reading Plans</CardTitle>
                <CardDescription className="text-base">
                  Guided reading plans from 30-day challenges to full Bible reading with daily progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Offline First */}
            <Card className="glass-morphism border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Download className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Offline First</CardTitle>
                <CardDescription className="text-base">
                  Complete Bible and all features work offline. Install as a mobile app for the best experience.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Community */}
            <Card className="glass-morphism border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Community</CardTitle>
                <CardDescription className="text-base">
                  Connect with other believers, share insights, and discover popular verses from the community.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Privacy Focused */}
            <Card className="glass-morphism border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Privacy First</CardTitle>
                <CardDescription className="text-base">
                  Your Bible study is personal. We collect minimal data and everything works locally on your device.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Verses Section with Modern Cards */}
      <section className="section-padding">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Most Loved Verses
            </h2>
            <p className="text-lg text-text-secondary">
              Discover the verses that inspire millions around the world
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="glass-morphism border-0 hover:shadow-2xl transition-all group">
              <CardContent className="p-8">
                <div className="flex items-start gap-3 mb-4">
                  <div className="holy-glow-subtle rounded-full p-2">
                    <Star className="h-5 w-5 text-holy-500" />
                  </div>
                  <Badge className="bg-water-100 text-water-700 border-water-200">John 3:16</Badge>
                </div>
                <blockquote className="verse-text text-text-primary mb-6">
                  "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
                </blockquote>
                <Button asChild variant="outline" className="group border-water-300 hover:border-water-400">
                  <Link href="/verse/john/3/16">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-0 hover:shadow-2xl transition-all group">
              <CardContent className="p-8">
                <div className="flex items-start gap-3 mb-4">
                  <div className="holy-glow-subtle rounded-full p-2">
                    <Star className="h-5 w-5 text-holy-500" />
                  </div>
                  <Badge className="bg-water-100 text-water-700 border-water-200">Philippians 4:13</Badge>
                </div>
                <blockquote className="verse-text text-text-primary mb-6">
                  "I can do all this through him who gives me strength."
                </blockquote>
                <Button asChild variant="outline" className="group border-water-300 hover:border-water-400">
                  <Link href="/verse/philippians/4/13">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-water-500 to-cyan-500" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="container-width relative text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Dive Deeper?
          </h2>
          <p className="text-lg md:text-xl text-water-100 mb-10 max-w-2xl mx-auto">
            Join thousands of believers who are discovering new depths in Scripture every day.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-white text-water-600 hover:bg-water-50 px-8 py-6 text-lg font-semibold">
              <Link href="/search">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
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