import type { ReactNode } from "react"

/**
 * Базовый тип категории для store (с иконкой как строкой)
 */
export interface CategoryStore {
  id: string
  name: string
  slug: string
  icon: string // Строковый идентификатор иконки
  color: string
  subcategories?: CategoryStore[]
  productCount: number
}

/**
 * Тип категории для UI компонентов (с ReactNode иконкой)
 */
export interface CategoryUI {
  id: string
  name: string
  slug: string
  icon: ReactNode // React компонент иконки
  color: string
  subcategories?: CategoryUI[]
  productCount: number
}

/**
 * Тип продукта
 */
export interface Product {
  id: string
  title: string
  price: number
  currency: "RUB" | "USD" | "EUR"
  location: string
  images: string[]
  seller: string
  condition: "new" | "excellent" | "good" | "fair"
  description: string
  createdAt: Date
  isFavorite: boolean
  isPromoted: boolean
}

/**
 * Опции фильтрации
 */
export interface FilterOptions {
  priceMin?: number
  priceMax?: number
  condition?: string[]
  location?: string
  category?: string
}

/**
 * Состояние marketplace
 */
export interface MarketplaceState {
  products: Product[]
  categories: CategoryStore[] // Используем store версию
  favorites: string[]
  searchQuery: string
  filters: FilterOptions
  selectedCategory: CategoryStore | null // Используем store версию
  loading: boolean
  error: string | null
}

/**
 * Действия marketplace
 */
export interface MarketplaceActions {
  setProducts: (products: Product[]) => void
  setSelectedCategory: (category: CategoryStore | null) => void // Используем store версию
  toggleFavorite: (productId: string) => void
  updateSearch: (query: string) => void
  applyFilters: (filters: FilterOptions) => void
  clearFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

/**
 * Полный тип store
 */
export type MarketplaceStore = MarketplaceState & MarketplaceActions

/**
 * Маппер для преобразования UI категории в store категорию
 */
export function mapUIToStoreCategory(uiCategory: CategoryUI): CategoryStore {
  return {
    ...uiCategory,
    icon: typeof uiCategory.icon === 'string' ? uiCategory.icon : 'default',
    subcategories: uiCategory.subcategories?.map(mapUIToStoreCategory)
  }
}

/**
 * Маппер для преобразования store категории в UI категорию
 * Требует мапинг иконок
 */
export function mapStoreToCategoryUI(
  storeCategory: CategoryStore, 
  iconMap: Record<string, ReactNode>
): CategoryUI {
  return {
    ...storeCategory,
    icon: iconMap[storeCategory.icon] || iconMap['default'] || null,
    subcategories: storeCategory.subcategories?.map(cat => 
      mapStoreToCategoryUI(cat, iconMap)
    )
  }
}

/**
 * Иконки категорий
 */
export const CATEGORY_ICONS = {
  TRANSPORT: 'transport',
  REAL_ESTATE: 'real-estate',
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  HOBBY: 'hobby',
  KIDS: 'kids',
  SERVICES: 'services',
  JOBS: 'jobs',
  DEFAULT: 'default'
} as const

export type CategoryIconType = typeof CATEGORY_ICONS[keyof typeof CATEGORY_ICONS]