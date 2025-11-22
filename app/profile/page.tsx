'use client'

import { useState, useEffect } from 'react'
import { Save, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

const ProfileContent = dynamic(() => Promise.resolve(ProfileContentComponent), {
  ssr: false
})

function ProfileContentComponent() {
  const [profile, setProfile] = useState({
    technician_name: '',
    license_number: '',
    company_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [supabaseClient, setSupabaseClient] = useState<any>(null)

  useEffect(() => {
    // Dynamically import and initialize Supabase client
    import('@/lib/supabase/client').then(({ createClient }) => {
      const client = createClient()
      setSupabaseClient(client)
      
      // Load profile data
      client.auth.getUser().then(({ data: { user } }: any) => {
        if (user) {
          client
            .from('profiles')
            .select('technician_name, license_number, company_name')
            .eq('id', user.id)
            .single()
            .then(({ data }: any) => {
              if (data) {
                setProfile({
                  technician_name: data.technician_name || '',
                  license_number: data.license_number || '',
                  company_name: data.company_name || ''
                })
              }
            })
        }
      })
    })
  }, [])

  const handleSave = async () => {
    if (!supabaseClient) return
    
    setLoading(true)
    setMessage('')
    
    try {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        const { error } = await supabaseClient
          .from('profiles')
          .update(profile)
          .eq('id', user.id)
        
        if (error) throw error
        setMessage('Profile saved successfully!')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-6 h-6" />
          Professional Profile
        </h1>
        
        <p className="text-gray-600 mb-6">
          Add your certification info to generate professional compliance reports.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profile.technician_name}
              onChange={(e) => setProfile({...profile, technician_name: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <input
              type="text"
              value={profile.license_number}
              onChange={(e) => setProfile({...profile, license_number: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              placeholder="SEP-2024-12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={profile.company_name}
              onChange={(e) => setProfile({...profile, company_name: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              placeholder="Smith Septic Services"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || !supabaseClient}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-h-[60px] px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>

          {message && (
            <p className={`text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return <ProfileContent />
}
