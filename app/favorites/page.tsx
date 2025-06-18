"use client"

import { useState } from "react"
import { Grid, List, Trash2 } from "lucide-react"
import Header from "@/components/navigation/Header"
import ProductGrid from "@/components/marketplace/ProductGrid"
import TelegramSticker from "@/components/ui/telegram-sticker"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const { favorites, toggleFavorite } = useMarketplaceStore()
  const { telegramTheme } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)

  const handleSelectAll = () => {
    if (selectedItems.length === favorites.length) {
      setSelectedItems([])
    } else {
      setSelectedItems([...favorites])
    }
  }

  const handleDeleteSelected = () => {
    selectedItems.forEach((id) => toggleFavorite(id))
    setSelectedItems([])
    setIsSelectionMode(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header
        title="Избранное"
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
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-4">
              <TelegramSticker sticker="DUCK_RAIN" size={120} />
            </div>
            <h2 className="font-display text-xl mb-2 text-neutral-800 dark:text-neutral-200">Пока пусто</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm">
              Добавляйте объявления в избранное, нажимая на ♡. Они будут сохраняться здесь.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-avito-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors"
            >
              Перейти к поиску
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">
                  {favorites.length} {favorites.length === 1 ? "объявление" : "объявлений"}
                </h2>
                {isSelectionMode && (
                  <button onClick={handleSelectAll} className="text-avito-primary font-medium hover:underline">
                    {selectedItems.length === favorites.length ? "Снять выделение" : "Выбрать все"}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!isSelectionMode ? (
                  <button
                    onClick={() => setIsSelectionMode(true)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium"
                  >
                    Выбрать
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsSelectionMode(false)
                        setSelectedItems([])
                      }}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium"
                    >
                      Отмена
                    </button>
                    {selectedItems.length > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Удалить ({selectedItems.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid
              viewMode={viewMode}
              selectionMode={isSelectionMode}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              showOnlyFavorites
            />
          </div>
        )}
      </main>
    </div>
  )
}
