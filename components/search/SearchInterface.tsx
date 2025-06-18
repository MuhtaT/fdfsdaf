"use client"

import { useState } from "react"
import { Search, Filter, X, Mic } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchSuggestion {
  id: string
  text: string
  type: "query" | "category" | "location"
}

interface FilterOptions {
  priceMin?: number
  priceMax?: number
  condition?: string[]
  location?: string
  category?: string
}

interface SearchInterfaceProps {
  placeholder: string
  value: string
  onValueChange: (value: string) => void
  suggestions: SearchSuggestion[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

export default function SearchInterface({
  placeholder,
  value,
  onValueChange,
  suggestions,
  filters,
  onFilterChange,
}: SearchInterfaceProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const filterValue = filters[key as keyof FilterOptions]
    return (
      filterValue !== undefined && filterValue !== null && (Array.isArray(filterValue) ? filterValue.length > 0 : true)
    )
  }).length

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onValueChange(suggestion.text)
    setIsFocused(false)
    router.push(`/search?q=${encodeURIComponent(suggestion.text)}`)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          className={`relative bg-white dark:bg-neutral-800 rounded-2xl border-2 transition-all duration-300 ${
            isFocused
              ? "border-avito-primary shadow-lg ring-4 ring-avito-primary/10"
              : "border-neutral-200 dark:border-neutral-700 shadow-sm"
          }`}
        >
          <div className="flex items-center px-4 py-3">
            <Search className="w-5 h-5 text-neutral-400 dark:text-neutral-500 mr-3" />
            <input
              type="text"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
              onKeyPress={(e) => {
                if (e.key === "Enter" && value.trim()) {
                  setIsFocused(false)
                  router.push(`/search?q=${encodeURIComponent(value)}`)
                }
              }}
            />
            {value && (
              <button
                onClick={() => onValueChange("")}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors mr-2"
              >
                <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              </button>
            )}
            <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <Mic className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            </button>
          </div>
        </div>

        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-100 dark:border-neutral-700 overflow-hidden backdrop-blur-md z-50">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center"
              >
                <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-3" />
                <span className="text-neutral-700 dark:text-neutral-300">{suggestion.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            showFilters || activeFiltersCount > 0
              ? "bg-avito-primary text-white shadow-sm"
              : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">{activeFiltersCount}</span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={() => onFilterChange({})}
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Сбросить все
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Цена, ₽</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="От"
                value={filters.priceMin || ""}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    priceMin: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  })
                }
                className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
              />
              <input
                type="number"
                placeholder="До"
                value={filters.priceMax || ""}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    priceMax: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  })
                }
                className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Состояние</label>
            <div className="flex flex-wrap gap-2">
              {["Новое", "Отличное", "Хорошее", "Удовлетворительное"].map((condition) => (
                <button
                  key={condition}
                  onClick={() => {
                    const currentConditions = filters.condition || []
                    const isSelected = currentConditions.includes(condition)
                    const newConditions = isSelected
                      ? currentConditions.filter((c) => c !== condition)
                      : [...currentConditions, condition]
                    onFilterChange({
                      ...filters,
                      condition: newConditions,
                    })
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.condition?.includes(condition)
                      ? "bg-avito-primary text-white"
                      : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
