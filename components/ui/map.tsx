'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { ExchangeRate } from '../exchange-rate-viewer'
import { GoogleMap, Marker } from '@react-google-maps/api';


interface MapProps {
  exchangeRates: ExchangeRate[]
  selectedStore: ExchangeRate | null
}

export function Map({ exchangeRates, selectedStore }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const containerStyle = {
    width: '100%',
    height: '400px'
  };
  const center = {
    lat: 22.3193,
    lng: 114.1694,
  };

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds(center)
    map.fitBounds(bounds)
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback() {
    setMap(null)
  }, [])


  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    })

    loader.load().then(() => {
      if (mapRef.current && !map) {
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 22.3193, lng: 114.1694 }, // Hong Kong center
          zoom: 11,
        })
        setMap(newMap)
      }
    })
  }, [map])

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null))
      setMarkers([])

      // Add new markers for exchange rates
      const newMarkers = exchangeRates
        .filter(rate => rate.latitude && rate.longitude)
        .map(rate => {
          const marker = new google.maps.Marker({
            position: { lat: rate.latitude!, lng: rate.longitude! },
            map,
            title: rate.store,
            icon: rate === selectedStore ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : undefined,
          })

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div>
                <h3>${rate.store}</h3>
                <p>Buy: ${rate.buyRate?.toFixed(4) ?? 'N/A'}</p>
                <p>Sell: ${rate.sellRate?.toFixed(4) ?? 'N/A'}</p>
                <p>Updated: ${rate.updateTime}</p>
              </div>
            `,
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })

          return marker
        })

      setMarkers(newMarkers)
    }
  }, [map, exchangeRates, selectedStore])

  useEffect(() => {
    if (map && selectedStore && selectedStore.latitude && selectedStore.longitude) {
      map.panTo({ lat: selectedStore.latitude, lng: selectedStore.longitude })
      map.setZoom(14)
    }
  }, [map, selectedStore])

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {exchangeRates.map((rate, index) => {
          if (rate.latitude && rate.longitude) {
            return (
              <Marker
                key={index}
                position={{ lat: rate.latitude, lng: rate.longitude }}
                icon={rate === selectedStore ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : undefined}
              />
            )
          }
          return null
        })}
      </GoogleMap>
    </div>
  )
}