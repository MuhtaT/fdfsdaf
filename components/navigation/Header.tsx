"use client"

import type React from "react"
import { ArrowLeft, Search, Heart, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface TelegramTheme {
  colorScheme: "light" | "dark"
  themeParams: {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
  }
}

interface HeaderProps {
  showBackButton?: boolean
  title?: string
  actions?: React.ReactNode[]
  theme: TelegramTheme
}

export default function Header({ showBackButton = false, title = "Marketplace", actions, theme }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200/50 dark:border-neutral-700/50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </button>
          )}
          <h1 className="font-display text-lg text-neutral-800 dark:text-neutral-200">{title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          {actions?.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
          {!actions && (
            <>
              <button
                onClick={() => router.push("/search")}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Search className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
              <button
                onClick={() => router.push("/favorites")}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Heart className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <User className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
