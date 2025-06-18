"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/stores/useThemeStore"

export function ThemeInitializer() {
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return null
}
