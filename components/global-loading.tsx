"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { FullScreenLoader } from "@/components/loading-skeleton"

export function GlobalLoading() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500) // Show loader for 500ms minimum

    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return <FullScreenLoader message="Loading page..." />
}

// Hook to manage loading states
export function usePageLoading() {
  const [loading, setLoading] = useState(false)

  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)

  return {
    loading,
    startLoading,
    stopLoading,
  }
}
