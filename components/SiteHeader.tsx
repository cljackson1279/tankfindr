'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/coverage', label: 'Coverage' },
  { href: '/pricing-pro', label: 'For Contractors' },
  { href: '/inspector-pro', label: 'For Inspectors', highlight: true },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
]

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-600 hover:text-green-700">
          TankFindr
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.highlight
                  ? 'text-purple-600 hover:text-purple-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              {link.label}
            </Link>
          ))}
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
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </nav>

        {/* Mobile menu button — previously the nav simply vanished on phones */}
        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-gray-700 hover:text-gray-900"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-white px-4 py-4 space-y-1 shadow-lg">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 px-2 rounded-lg text-base ${
                link.highlight
                  ? 'text-purple-600 font-medium hover:bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t mt-2">
            {!isLoggedIn ? (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
            ) : (
              <div className="space-y-2">
                <Link href="/pro" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Dashboard
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
