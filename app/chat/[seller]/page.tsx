"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Phone, MoreVertical, ImageIcon } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Header from "@/components/navigation/Header"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

interface Message {
  id: string
  text: string
  sender: "me" | "seller"
  timestamp: Date
  type: "text" | "image" | "product"
  productInfo?: {
    title: string
    price: number
    image: string
  }
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Здравствуйте! Интересует ваш iPhone. Актуален?",
    sender: "me",
    timestamp: new Date("2024-01-15T10:00:00"),
    type: "text",
  },
  {
    id: "2",
    text: "Добрый день! Да, актуален. Все в отличном состоянии.",
    sender: "seller",
    timestamp: new Date("2024-01-15T10:05:00"),
    type: "text",
  },
  {
    id: "3",
    text: "Можно посмотреть дополнительные фото?",
    sender: "me",
    timestamp: new Date("2024-01-15T10:10:00"),
    type: "text",
  },
  {
    id: "4",
    text: "Конечно, сейчас отправлю",
    sender: "seller",
    timestamp: new Date("2024-01-15T10:12:00"),
    type: "text",
  },
  {
    id: "5",
    text: "",
    sender: "seller",
    timestamp: new Date("2024-01-15T10:15:00"),
    type: "product",
    productInfo: {
      title: "iPhone 15 Pro Max 256GB",
      price: 120000,
      image: "/placeholder.svg?height=200&width=200",
    },
  },
]

export default function ChatPage() {
  const params = useParams()
  const seller = params.seller as string
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { telegramTheme } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "me",
        timestamp: new Date(),
        type: "text",
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="h-screen max-h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      <Header
        showBackButton
        title={decodeURIComponent(seller)}
        theme={safeTheme}
        actions={[
          <button
            key="phone"
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Phone className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>,
          <button
            key="more"
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>,
        ]}
      />

      {/* Chat Messages */}
      <div className="flex-1 pt-16 pb-20 overflow-y-auto">
        <div className="container mx-auto px-4 space-y-4 py-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] ${
                  message.sender === "me"
                    ? "bg-avito-primary text-white"
                    : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                } rounded-2xl px-4 py-3 shadow-sm`}
              >
                {message.type === "text" && (
                  <div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div
                      className={`text-xs mt-1 ${message.sender === "me" ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"}`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                )}

                {message.type === "product" && message.productInfo && (
                  <div className="bg-white dark:bg-neutral-700 rounded-xl p-3 border border-neutral-200 dark:border-neutral-600">
                    <div className="flex space-x-3">
                      <Image
                        src={message.productInfo.image || "/placeholder.svg"}
                        alt={message.productInfo.title}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-800 dark:text-neutral-200 text-sm mb-1">
                          {message.productInfo.title}
                        </h4>
                        <div className="text-avito-primary font-bold">{formatPrice(message.productInfo.price)}</div>
                      </div>
                    </div>
                    <div
                      className={`text-xs mt-2 ${message.sender === "me" ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"}`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 pb-safe">
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
            <Paperclip className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
            <ImageIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Написать сообщение..."
              className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-2xl outline-none focus:ring-2 focus:ring-avito-primary focus:bg-white dark:focus:bg-neutral-600 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-avito-primary text-white rounded-full hover:bg-avito-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
