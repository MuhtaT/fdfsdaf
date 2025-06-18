"use client"

import { useState } from "react"
import { Search, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "@/components/navigation/Header"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  productTitle?: string
  productImage?: string
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Александр",
    avatar: "/placeholder.svg?height=50&width=50",
    lastMessage: "Добрый день! Да, актуален. Все в отличном состоянии.",
    lastMessageTime: new Date("2024-01-15T14:30:00"),
    unreadCount: 2,
    isOnline: true,
    productTitle: "iPhone 15 Pro Max 256GB",
    productImage: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Мария",
    avatar: "/placeholder.svg?height=50&width=50",
    lastMessage: "Спасибо за покупку! Оставьте, пожалуйста, отзыв",
    lastMessageTime: new Date("2024-01-15T12:15:00"),
    unreadCount: 0,
    isOnline: false,
    productTitle: 'MacBook Air M2 13"',
    productImage: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Дмитрий",
    avatar: "/placeholder.svg?height=50&width=50",
    lastMessage: "Можем встретиться завтра в 18:00?",
    lastMessageTime: new Date("2024-01-14T16:45:00"),
    unreadCount: 1,
    isOnline: true,
    productTitle: "Toyota Camry 2020",
    productImage: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Елена",
    avatar: "/placeholder.svg?height=50&width=50",
    lastMessage: "Квартира еще актуальна?",
    lastMessageTime: new Date("2024-01-14T10:20:00"),
    unreadCount: 0,
    isOnline: false,
    productTitle: "Квартира 2-к, 65 м²",
    productImage: "/placeholder.svg?height=40&width=40",
  },
]

export default function MessagesPage() {
  const [chats] = useState<Chat[]>(mockChats)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { telegramTheme } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } else if (diffDays === 2) {
      return "Вчера"
    } else {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
      }).format(date)
    }
  }

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (chats.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header title="Сообщения" theme={safeTheme} />

        <main className="container mx-auto px-4 pt-16 pb-20">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h2 className="font-display text-xl mb-2 text-neutral-800 dark:text-neutral-200">Нет сообщений</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm">
              Здесь будут отображаться ваши диалоги с покупателями и продавцами
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title="Сообщения" theme={safeTheme} />

      <main className="container mx-auto px-4 pt-16 pb-20">
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по сообщениям"
                className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-avito-primary transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400"
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => router.push(`/chat/${encodeURIComponent(chat.name)}`)}
                className="w-full bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left border border-neutral-100 dark:border-neutral-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={chat.avatar || "/placeholder.svg"}
                      alt={chat.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-avito-success rounded-full border-2 border-white dark:border-neutral-800"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{chat.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <div className="bg-avito-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mb-2">{chat.lastMessage}</p>

                    {chat.productTitle && (
                      <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-neutral-700 rounded-lg p-2">
                        <Image
                          src={chat.productImage || "/placeholder.svg"}
                          alt={chat.productTitle}
                          width={30}
                          height={30}
                          className="rounded object-cover"
                        />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {chat.productTitle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredChats.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-neutral-600 dark:text-neutral-400">Ничего не найдено по запросу "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
