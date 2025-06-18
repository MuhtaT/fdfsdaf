"use client"

import { useState } from "react"
import { STICKERS, type StickerType } from "@/lib/stickers"

interface TelegramStickerProps {
  sticker: StickerType
  size?: number
  className?: string
  loop?: boolean // ✅ Добавлен пропс loop
}

const EMOJI_FALLBACKS: Record<StickerType, string> = {
  DUCK_LAUGH: "😂",
  DUCK_HEART: "🥰", 
  DUCK_WAVE: "👋",
  DUCK_RAIN: "😢",
  DUCK_LOADING: "⏳",
  DUCK_PLANE: "✈️",
}

export default function TelegramSticker({
  sticker,
  size = 120,
  className = "",
  loop = true, // ✅ По умолчанию зацикливаем
}: TelegramStickerProps) {
  const [hasError, setHasError] = useState(false)

  const gifPath = STICKERS[sticker].replace('.tgs', '.gif')
  
  if (hasError) {
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gradient-to-br from-avito-primary/10 to-avito-accent/10 rounded-2xl border-2 border-avito-primary/20 ${className}`}
        style={{ width: size, height: size }}
        title={`${sticker} (fallback)`}
      >
        <span style={{ fontSize: size * 0.4 }}>
          {EMOJI_FALLBACKS[sticker]}
        </span>
      </div>
    )
  }

  return (
    <div className={`inline-block rounded-lg overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <img
        src={gifPath}
        alt={sticker}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        style={{ 
          width: '100%',
          height: '100%',
          display: 'block',
          // ✅ Для GIF контроль зацикливания ограничен, но можем добавить CSS
          animationIterationCount: loop ? 'infinite' : '1',
        }}
        // ✅ Дополнительный атрибут для совместимости (хотя большинство браузеров его игнорируют для GIF)
        {...(!loop && { 'data-loop': 'false' })}
      />
    </div>
  )
}