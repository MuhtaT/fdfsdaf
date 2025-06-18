"use client"

import { useState } from "react"
import { Grid, List } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/navigation/Header"
import ProductGrid from "@/components/marketplace/ProductGrid"
import SearchInterface from "@/components/search/SearchInterface"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

const categoryData: Record<string, { name: string; description: string }> = {
  transport: { name: "Транспорт", description: "Автомобили, мотоциклы, запчасти" },
  "real-estate": { name: "Недвижимость", description: "Квартиры, дома, коммерческая недвижимость" },
  electronics: { name: "Электроника", description: "Телефоны, компьютеры, бытовая техника" },
  clothing: { name: "Одежда", description: "Мужская, женская и детская одежда" },
  hobby: { name: "Хобби и отдых", description: "Спорт, музыка, книги, игры" },
  kids: { name: "Детские товары", description: "Игрушки, одежда, коляски" },
  services: { name: "Услуги", description: "Ремонт, уборка, репетиторство" },
  jobs: { name: "Работа", description: "Вакансии и резюме" },
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("date")
  const { searchQuery, filters } = useMarketplaceStore()
  const { telegramTheme } = useThemeStore()

  const category = categoryData[slug] || { name: "Категория", description: "" }

  // Используем безопасную функцию создания темы
  const safeTheme = createSafeTelegramTheme(telegramTheme)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header
        showBackButton
        title={category.name}
        theme={safeTheme}
        actions={[
          <button
            key="view-toggle"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {viewMode === "grid" ? (
              <List className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <Grid className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>,
        ]}
      />

      <main className="container mx-auto px-4 pt-16 pb-20">
        <div className="space-y-6">
          {/* Информация о категории */}
          <div 
            className="rounded-2xl p-4 shadow-sm"
            style={{
              backgroundColor: safeTheme.themeParams.secondary_bg_color,
            }}
          >
            <h2 
              className="font-display text-lg mb-2"
              style={{ color: safeTheme.themeParams.text_color }}
            >
              {category.name}
            </h2>
            <p 
              className="text-sm"
              style={{ color: safeTheme.themeParams.hint_color }}
            >
              {category.description}
            </p>
          </div>

          {/* Поиск */}
          <SearchInterface
            placeholder={`Поиск в категории "${category.name}"`}
            value={searchQuery}
            onValueChange={(value) => useMarketplaceStore.getState().updateSearch(value)}
            suggestions={[]}
            filters={filters}
            onFilterChange={(filters) => useMarketplaceStore.getState().applyFilters(filters)}
          />

          {/* Сортировка */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "date", label: "По дате" },
                { key: "price-low", label: "Дешевле" },
                { key: "price-high", label: "Дороже" },
                { key: "popular", label: "Популярные" }
              ].map((sort) => (
                <button
                  key={sort.key}
                  onClick={() => setSortBy(sort.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    sortBy === sort.key
                      ? "text-white shadow-md"
                      : "border hover:shadow-sm"
                  }`}
                  style={{
                    backgroundColor: sortBy === sort.key 
                      ? safeTheme.themeParams.button_color 
                      : safeTheme.themeParams.secondary_bg_color,
                    color: sortBy === sort.key 
                      ? safeTheme.themeParams.button_text_color 
                      : safeTheme.themeParams.text_color,
                    borderColor: sortBy === sort.key 
                      ? safeTheme.themeParams.button_color 
                      : safeTheme.themeParams.hint_color,
                  }}
                >
                  {sort.label}
                </button>
              ))}
            </div>

            {/* Счетчик товаров (можно добавить позже) */}
            <div 
              className="text-sm"
              style={{ color: safeTheme.themeParams.hint_color }}
            >
              {/* Найдено: 42 товара */}
            </div>
          </div>

          {/* Сетка товаров */}
          <ProductGrid viewMode={viewMode} />
        </div>
      </main>
    </div>
  )
}