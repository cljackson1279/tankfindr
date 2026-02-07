'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Settings } from 'lucide-react'

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-600 hover:text-green-700">
          TankFindr
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/coverage" className="text-gray-600 hover:text-gray-900">
            Coverage
          </Link>
          <Link href="/pricing-pro" className="text-gray-600 hover:text-gray-900">
            For Contractors
          </Link>
          <Link href="/inspector-pro" className="text-purple-600 hover:text-purple-900 font-medium">
            For Inspectors
          </Link>
          <Link href="/blog" className="text-gray-600 hover:text-gray-900">
            Blog
          </Link>
          <Link href="/faq" className="text-gray-600 hover:text-gray-900">
            FAQ
          </Link>
          {!isLoggedIn ? (
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <>
              <Link href="/pro">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Dashboard
                </Button>
              </Link>
              <Link href="/account">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  window.location.reload()
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
