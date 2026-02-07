import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Septic Tank Blog | Expert Guides & Tips | TankFindr',
  description: '📚 Expert guides on finding septic tanks, maintenance tips, and property inspection advice. Learn from industry professionals. Free resources for homeowners, contractors, and inspectors.',
  keywords: [
    'septic tank blog',
    'septic system guides',
    'how to find septic tank',
    'septic tank maintenance',
    'septic inspection tips',
    'septic tank location',
    'homeowner septic guide',
    'contractor resources',
  ],
  openGraph: {
    title: 'Septic Tank Blog | Expert Guides & Tips',
    description: '📚 Expert guides on finding septic tanks, maintenance tips, and property inspection advice.',
    type: 'website',
    url: 'https://tankfindr.com/blog',
  },
  alternates: {
    canonical: '/blog',
  },
}

const blogPosts = [
  {
    slug: 'how-to-find-your-septic-tank',
    title: 'How to Find Your Septic Tank: Complete 2025 Guide',
    excerpt: 'Learn 7 proven methods to locate your septic tank, from property records to professional tools. Includes step-by-step instructions, cost comparisons, and expert tips.',
    date: '2025-02-06',
    readTime: '12 min read',
    category: 'Guides',
    image: '/blog/find-septic-tank.jpg',
  },
  {
    slug: 'septic-vs-sewer-how-to-tell',
    title: 'Septic vs Sewer: How to Tell What Your House Has',
    excerpt: 'Discover 5 simple ways to determine if your property uses septic or sewer. Includes visual inspection tips, record searches, and what to do if you\'re unsure.',
    date: '2025-02-06',
    readTime: '8 min read',
    category: 'Homeowner Tips',
    image: '/blog/septic-vs-sewer.jpg',
  },
  {
    slug: 'septic-tank-inspection-checklist',
    title: 'Septic Tank Inspection Checklist for Home Buyers',
    excerpt: 'Complete pre-purchase septic inspection guide. Learn what inspectors check, red flags to watch for, and how to negotiate repairs. Save thousands on your home purchase.',
    date: '2025-02-06',
    readTime: '10 min read',
    category: 'Inspections',
    image: '/blog/inspection-checklist.jpg',
  },
  {
    slug: 'florida-septic-tank-regulations',
    title: 'Florida Septic Tank Regulations: What You Need to Know',
    excerpt: 'Navigate Florida\'s septic system laws, permit requirements, and inspection schedules. County-specific rules for Miami-Dade, Broward, Palm Beach, and all 67 FL counties.',
    date: '2025-02-06',
    readTime: '9 min read',
    category: 'Regulations',
    image: '/blog/florida-regulations.jpg',
  },
  {
    slug: 'septic-tank-gps-coordinates-guide',
    title: 'Using GPS Coordinates to Locate Septic Tanks',
    excerpt: 'Professional guide to GPS-based septic tank location. Learn how contractors use coordinates, accuracy requirements, and how to mark your tank permanently.',
    date: '2025-02-06',
    readTime: '7 min read',
    category: 'Professional Tips',
    image: '/blog/gps-coordinates.jpg',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SiteHeader />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Septic Tank Knowledge Hub
            </h1>
            <p className="text-xl text-blue-100">
              Expert guides, tips, and resources for homeowners, contractors, and inspectors
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-6xl">📝</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <Button className="w-full group">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Septic Tank?
          </h2>
          <p className="text-xl text-blue-100 mb-6">
            Access 2.3M+ verified septic tank records instantly
          </p>
          <Link href="/pro">
            <Button size="lg" variant="secondary">
              Try TankFindr Pro Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
