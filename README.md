# 💧 holydrop - Where Wisdom Drops onto Scripture

A community-powered Bible annotation platform that brings deeper understanding to God's Word through collaborative insights and discussions.

![holydrop Preview](./docs/preview.png) *<!-- Add screenshot here -->*

## 🌟 Overview

holydrop.app is a modern, social Bible study platform designed to foster community-driven biblical understanding. Like Genius.com for music, holydrop allows users to annotate verses, share insights, and learn from each other's wisdom in a beautiful, water-themed interface.

### ✨ Key Features

#### 📖 **Bible Study**
- **Complete KJV Bible** with searchable text
- **Verse-by-verse annotations** from the community
- **Advanced search** with FlexSearch integration
- **Cross-references** and study tools
- **Virtual scrolling** for performance with long chapters

#### 🤝 **Social Features**
- **Community annotations** with upvoting/downvoting
- **User profiles** showcasing contributions
- **Reputation system** with water-themed levels (Seeker → Student → Scholar → Sage)
- **Comment threads** on annotations
- **Social sharing** to Twitter, Facebook, and more

#### 💧 **Water-Themed Design**
- **Immersive animations** with water drops and ripples
- **Spiritual metaphors** throughout the interface
- **Peaceful blue color palette** for contemplative study
- **"Drops of wisdom"** as the core interaction model

#### 🚀 **Modern Technology**
- **Lightning-fast search** across all scripture
- **Real-time notifications** for community activity
- **Mobile-responsive** design for study anywhere
- **Offline-capable** progressive web app

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Window** - Virtualized lists for performance
- **TipTap** - Rich text editor for annotations

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Secure user data access
- **Supabase Auth** - Authentication with social providers
- **Edge Functions** - Server-side logic

### **Search & Performance**
- **FlexSearch** - Full-text search engine
- **Vercel Edge Network** - Global CDN
- **Service Workers** - Offline functionality
- **Bundle optimization** - Fast loading times

### **Integrations**
- **Social sharing APIs** - Twitter, Facebook integration
- **Stripe** - Donation processing
- **Email services** - Notifications and updates
- **Analytics** - Privacy-friendly tracking

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/holydrop/holydrop.git
   cd holydrop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up the database**
   ```bash
   # Run schema.sql in your Supabase SQL editor
   # Import Bible data (see docs/data-setup.md)
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
holydrop/
├── app/                    # Next.js app directory
│   ├── [book]/[chapter]/  # Dynamic Bible routes
│   ├── search/            # Search page
│   ├── profile/           # User profiles
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── annotation/        # Annotation system
│   ├── bible/             # Bible display components
│   ├── search/            # Search functionality
│   ├── social/            # Social features
│   └── ui/                # Shared UI components
├── lib/                   # Utilities and helpers
│   ├── bible/             # Bible data and utilities
│   ├── search/            # Search implementation
│   ├── supabase/          # Database client
│   └── reputation/        # User reputation system
├── contexts/              # React contexts
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics, monitoring, etc.
SENTRY_DSN=your_sentry_dsn
STRIPE_SECRET_KEY=your_stripe_key
```

### Custom Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📖 Usage Guide

### For Users

1. **Browse Scripture** - Navigate to any Bible book/chapter
2. **Search Verses** - Use the search bar (press "/" to focus)
3. **Add Annotations** - Click any verse to add your insights
4. **Vote on Wisdom** - Upvote helpful annotations
5. **Join Discussions** - Comment on annotations
6. **Build Reputation** - Earn levels through helpful contributions

### For Developers

1. **Component Development** - All components are in `/components`
2. **Database Queries** - Use Supabase client in `/lib/supabase`
3. **Styling** - Tailwind classes with water theme utilities
4. **Testing** - Run `npm test` for unit tests

## 🙏 Mission Statement

holydrop exists to make God's Word more accessible and understandable through the wisdom of Christian community. We believe that iron sharpens iron, and that when believers study together, deeper understanding emerges.

*"As iron sharpens iron, so one person sharpens another."* - Proverbs 27:17

---

*Built with ❤️ and faith by the Christian developer community*

**"Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom"** - Colossians 3:16

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
