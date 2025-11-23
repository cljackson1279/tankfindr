'use client'

import { useEffect, useRef } from 'react'

interface MapComponentProps {
  lat: number
  lng: number
  searchLat?: number
  searchLng?: number
}

export default function MapComponent({ lat, lng, searchLat, searchLng }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Load Mapbox GL JS
    const loadMapbox = async () => {
      // Check if already loaded
      if ((window as any).mapboxgl) {
        initMap()
        return
      }

      // Load CSS
      const link = document.createElement('link')
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      // Load JS
      const script = document.createElement('script')
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
      script.onload = () => initMap()
      document.head.appendChild(script)
    }

    const initMap = () => {
      const mapboxgl = (window as any).mapboxgl
      if (!mapboxgl || !mapRef.current) return

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [lng, lat],
        zoom: 18,
      })

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add marker for tank location
      new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            '<strong>Septic Tank Location</strong><br/>GPS Coordinates'
          )
        )
        .addTo(map)

      // Add marker for search location if different
      if (searchLat && searchLng && (searchLat !== lat || searchLng !== lng)) {
        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([searchLng, searchLat])
          .setPopup(
            new mapboxgl.Popup().setHTML('<strong>Search Address</strong>')
          )
          .addTo(map)

        // Fit bounds to show both markers
        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([lng, lat])
        bounds.extend([searchLng, searchLat])
        map.fitBounds(bounds, { padding: 50 })
      }

      mapInstanceRef.current = map
    }

    loadMapbox()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [lat, lng, searchLat, searchLng])

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-lg"
      style={{ minHeight: '384px' }}
    />
  )
}
