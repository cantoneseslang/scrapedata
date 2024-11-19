// components/ui/ad-space.tsx
import React from 'react'

interface AdSpaceProps {
  className?: string
  isTop?: boolean
}

export default function AdSpace({ className = "", isTop = false }: AdSpaceProps) {
  return (
    <div className={`bg-gray-100 rounded-lg ${className}`}>
      <div className="flex items-center justify-center h-full text-gray-400">
        {isTop ? "トップ広告スペース" : "広告スペース"}
      </div>
    </div>
  )
}