"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function NavigationProgress() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    setProgress(0)

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 100)

    // Complete loading after a short delay
    const completeTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimer)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
