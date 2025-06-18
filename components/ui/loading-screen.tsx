"use client"

import TelegramSticker from "./telegram-sticker"

interface LoadingScreenProps {
  title?: string
  subtitle?: string
  showSticker?: boolean
}

export default function LoadingScreen({ title = "Загрузка...", subtitle, showSticker = true }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center z-50">
      {showSticker && (
        <div className="mb-6">
          <TelegramSticker sticker="DUCK_LOADING" size={120} />
        </div>
      )}

      <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">{title}</h2>

      {subtitle && <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-sm">{subtitle}</p>}

      <div className="mt-6 flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-avito-primary rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
