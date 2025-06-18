"use client"

import Header from "@/components/navigation/Header"
import CategoryGrid from "@/components/marketplace/CategoryGrid"
import SearchInterface from "@/components/search/SearchInterface"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

export default function HomePage() {
  const { searchQuery, filters } = useMarketplaceStore()
  const { telegramTheme } = useThemeStore()
  const telegramThemeSafe = createSafeTelegramTheme(telegramTheme)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title="Avito Clone" theme={telegramThemeSafe} />

      <main className="container mx-auto px-4 pt-16 pb-20">
        <div className="space-y-6">
          <SearchInterface
            placeholder="Поиск товаров и услуг"
            value={searchQuery}
            onValueChange={(value) => useMarketplaceStore.getState().updateSearch(value)}
            suggestions={[]}
            filters={filters}
            onFilterChange={(filters) => useMarketplaceStore.getState().applyFilters(filters)}
          />

          <CategoryGrid />
        </div>
      </main>
    </div>
  )
}
