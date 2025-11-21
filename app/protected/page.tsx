'use client'

import dynamic from 'next/dynamic'

const TankLocator = dynamic(() => import('@/components/TankLocator'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
})

export default function ProtectedPage() {
  return <TankLocator />
}
