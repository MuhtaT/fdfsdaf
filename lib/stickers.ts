// Telegram stickers configuration
export const STICKERS = {
  DUCK_LAUGH: "/stickers/duck-laugh.tgs",
  DUCK_HEART: "/stickers/duck-heart.tgs", 
  DUCK_WAVE: "/stickers/duck-wave.tgs",
  DUCK_RAIN: "/stickers/duck-rain.tgs",
  DUCK_LOADING: "/stickers/duck-loading.tgs",
  DUCK_PLANE: "/stickers/duck-plane.tgs",
} as const

export type StickerType = keyof typeof STICKERS

// Метаданные стикеров
export const STICKER_METADATA = {
  DUCK_LAUGH: {
    name: "Смеющийся утёнок",
    emotion: "happy" as const,
    description: "Весёлый утёнок смеется",
  },
  DUCK_HEART: {
    name: "Утёнок с сердечком", 
    emotion: "love" as const,
    description: "Утёнок дарит любовь",
  },
  DUCK_WAVE: {
    name: "Машущий утёнок",
    emotion: "greeting" as const, 
    description: "Утёнок машет лапкой",
  },
  DUCK_RAIN: {
    name: "Утёнок под дождём",
    emotion: "sad" as const,
    description: "Грустный утёнок под дождём",
  },
  DUCK_LOADING: {
    name: "Загружающийся утёнок",
    emotion: "neutral" as const,
    description: "Утёнок показывает процесс загрузки",
  },
  DUCK_PLANE: {
    name: "Утёнок-самолётик",
    emotion: "excited" as const,
    description: "Утёнок летит как самолётик",
  },
} as const

type EmotionType = "happy" | "love" | "greeting" | "sad" | "neutral" | "excited"

// Простые утилиты
export const stickerUtils = {
  /**
   * Получить GIF путь для стикера
   */
  getGifPath(sticker: StickerType): string {
    return STICKERS[sticker].replace('.tgs', '.gif')
  },

  /**
   * Получить случайный стикер
   */
  getRandomSticker(): StickerType {
    const stickers = Object.keys(STICKERS) as StickerType[]
    const randomIndex = Math.floor(Math.random() * stickers.length)
    return stickers[randomIndex]
  },

  /**
   * Получить стикер по эмоции
   */
  getStickerByEmotion(emotion: EmotionType): StickerType | null {
    const stickers = Object.entries(STICKER_METADATA) as [StickerType, typeof STICKER_METADATA[StickerType]][]
    const found = stickers.find(([_, meta]) => meta.emotion === emotion)
    return found ? found[0] : null
  },

  /**
   * Получить метаданные стикера
   */
  getMetadata(sticker: StickerType) {
    return STICKER_METADATA[sticker]
  },
}

// Группировка стикеров по контексту использования
export const STICKER_CONTEXTS = {
  welcome: ["DUCK_WAVE", "DUCK_HEART", "DUCK_PLANE"] as StickerType[],
  loading: ["DUCK_LOADING"] as StickerType[],
  success: ["DUCK_LAUGH", "DUCK_HEART"] as StickerType[],
  error: ["DUCK_RAIN"] as StickerType[],
  celebration: ["DUCK_PLANE", "DUCK_LAUGH"] as StickerType[],
} as const