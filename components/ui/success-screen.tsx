"use client"

import { useRouter } from "next/navigation"
import TelegramSticker from "./telegram-sticker"

interface SuccessScreenProps {
  title: string
  subtitle?: string
  sticker: "DUCK_HEART" | "DUCK_PLANE" | "DUCK_LAUGH"
  buttonText?: string
  onButtonClick?: () => void
  redirectPath?: string
}

export default function SuccessScreen({
  title,
  subtitle,
  sticker,
  buttonText = "Продолжить",
  onButtonClick,
  redirectPath,
}: SuccessScreenProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick()
    } else if (redirectPath) {
      router.push(redirectPath)
    }
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center z-50 p-4">
      <div className="mb-6">
        <TelegramSticker sticker={sticker} size={150} loop={false} />
      </div>

      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-3 text-center">{title}</h2>

      {subtitle && <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-sm mb-8">{subtitle}</p>}

      <button
        onClick={handleClick}
        className="bg-avito-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  )
}
