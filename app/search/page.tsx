"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Grid, List, SortAsc } from "lucide-react"
import Header from "@/components/navigation/Header"
import ProductGrid from "@/components/marketplace/ProductGrid"
import SearchInterface from "@/components/search/SearchInterface"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const { searchQuery, filters, updateSearch } = useMarketplaceStore()
  const { telegramTheme } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)

  useEffect(() => {
    if (query && query !== searchQuery) {
      updateSearch(query)
    }
  }, [query, searchQuery, updateSearch])

  const mockSearchResults = {
    total: 1247,
    results: [],
  }

  return (
    <div className="h-screen max-h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
      <Header
        showBackButton
        title="Поиск"
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
        <div className="space-y-4">
          <SearchInterface
            placeholder="Поиск товаров и услуг"
            value={searchQuery}
            onValueChange={updateSearch}
            suggestions={[
              { id: "1", text: "iPhone 15", type: "query" },
              { id: "2", text: "MacBook Air", type: "query" },
              { id: "3", text: "Toyota Camry", type: "query" },
            ]}
            filters={filters}
            onFilterChange={(filters) => useMarketplaceStore.getState().applyFilters(filters)}
          />

          {searchQuery && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Найдено {mockSearchResults.total.toLocaleString("ru-RU")} объявлений
                </h2>
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                По запросу: <span className="font-medium">"{searchQuery}"</span>
              </div>
            </div>
          )}

          {searchQuery && (
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto">
                {[
                  { key: "relevance", label: "По релевантности" },
                  { key: "date", label: "По дате" },
                  { key: "price-low", label: "Дешевле" },
                  { key: "price-high", label: "Дороже" },
                  { key: "distance", label: "По расстоянию" },
                ].map((sort) => (
                  <button
                    key={sort.key}
                    onClick={() => setSortBy(sort.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      sortBy === sort.key
                        ? "bg-avito-primary text-white"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchQuery ? (
            <ProductGrid viewMode={viewMode} />
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <SortAsc className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h2 className="font-display text-xl mb-2 text-neutral-800 dark:text-neutral-200">Начните поиск</h2>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                Введите название товара или услуги в поисковую строку выше
              </p>
            </div>
          )}

          {!searchQuery && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Популярные запросы</h3>
              <div className="flex flex-wrap gap-2">
                {["iPhone", "MacBook", "Квартира", "Автомобиль", "Велосипед", "Диван", "Холодильник", "Ноутбук"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => updateSearch(term)}
                      className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-full text-sm font-medium transition-colors text-neutral-700 dark:text-neutral-300"
                    >
                      {term}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
