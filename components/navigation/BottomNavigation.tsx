"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Package, Heart, MessageCircle, User } from "lucide-react"

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: Heart, label: "Избранное", path: "/favorites" },
  { icon: Package, label: "Объявления", path: "/my-ads" },
  { icon: MessageCircle, label: "Сообщения", path: "/messages" },
  { icon: User, label: "Профиль", path: "/profile" },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show bottom navigation on certain pages
  const hideOnPages = ["/chat/", "/product/", "/category/", "/create", "/search"]
  const shouldHide = hideOnPages.some((page) => pathname.startsWith(page))

  if (shouldHide) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 pb-safe z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                isActive
                  ? "text-avito-primary"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-avito-primary" : ""}`} />
              <span className={`text-xs font-medium truncate ${isActive ? "text-avito-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
