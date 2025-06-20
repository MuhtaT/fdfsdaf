import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import BottomNavigation from "@/components/navigation/BottomNavigation"
import { TelegramProvider } from "@/providers/TelegramProvider"
import { AuthProviderWithPassword } from "@/components/auth/AuthProviderWithPassword"
import { ThemeInitializer } from "./theme-initializer"
import { AppInitializer, TelegramUserInfo } from "./app-initializer"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Avrora Marketplace | Telegram Mini App",
  description: "Покупайте и продавайте товары прямо в Telegram! Удобная торговая площадка для всех.",
  keywords: ["telegram", "mini app", "marketplace", "торговля", "объявления", "товары"],
  authors: [{ name: "Avrora Team" }],
  creator: "Avrora Marketplace",
  publisher: "Avrora",
  robots: "index, follow",
  
  // Open Graph для шаринга
  openGraph: {
    type: "website",
    title: "Avrora Marketplace",
    description: "Торговая площадка в Telegram",
    siteName: "Avrora Marketplace",
    locale: "ru_RU",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Avrora Marketplace",
    description: "Торговая площадка в Telegram",
  },

  // Манифест для PWA
  manifest: "/manifest.json",

  // Telegram специфичные мета-теги
  other: {
    "telegram-app": "true",
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "default",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1c1e' }
  ],
  colorScheme: 'light dark',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.className}>
      <head>
        {/* Telegram WebApp Script */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
        
        {/* Preconnect для ускорения загрузки */}
        <link rel="preconnect" href="https://telegram.org" />
        <link rel="preconnect" href="https://core.telegram.org" />
        
        {/* Иконки */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Стили для предотвращения FOUC */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Предотвращаем flash перед загрузкой стилей */
            html { visibility: hidden; }
            html.loaded { visibility: visible; }
          `
        }} />
      </head>
      
      <body className="telegram-viewport antialiased">
        {/* Основной провайдер Telegram */}
        <TelegramProvider enableMock={process.env.NODE_ENV === 'development'}>
          {/* Инициализатор темы */}
          <ThemeInitializer />
          
          {/* Инициализатор приложения */}
          <AppInitializer />
          
          {/* Провайдер аутентификации с паролями */}
          <AuthProviderWithPassword>
            {/* Основной контент */}
            <main className="min-h-screen pb-safe relative">
              {children}
            </main>
            
            {/* Нижняя навигация */}
            <BottomNavigation />
          </AuthProviderWithPassword>
          
          {/* Информация о пользователе в dev режиме */}
          {process.env.NODE_ENV === 'development' && <TelegramUserInfo />}
        </TelegramProvider>

        {/* Скрипт для предотвращения FOUC */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.documentElement.classList.add('loaded');
          `
        }} />
      </body>
    </html>
  )
}