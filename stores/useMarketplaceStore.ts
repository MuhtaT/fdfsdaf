import { create } from "zustand"
import type { 
  CategoryStore, 
  Product, 
  FilterOptions, 
  MarketplaceState, 
  MarketplaceActions, 
  MarketplaceStore 
} from "@/types/marketplace"

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  // State
  products: [],
  categories: [],
  favorites: [],
  searchQuery: "",
  filters: {},
  selectedCategory: null,
  loading: false,
  error: null,

  // Actions
  setProducts: (products) => set({ products }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  toggleFavorite: (productId) =>
    set((state) => {
      const favorites = state.favorites.includes(productId)
        ? state.favorites.filter((id) => id !== productId)
        : [...state.favorites, productId]

      const products = state.products.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product,
      )

      return { favorites, products }
    }),

  updateSearch: (query) => set({ searchQuery: query }),

  applyFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}))

/**
 * Селекторы для удобного доступа к данным
 */
export const useMarketplaceSelectors = () => {
  const store = useMarketplaceStore()
  
  return {
    // Основные селекторы
    products: store.products,
    categories: store.categories,
    selectedCategory: store.selectedCategory,
    favorites: store.favorites,
    loading: store.loading,
    error: store.error,
    
    // Вычисляемые селекторы
    favoriteProducts: store.products.filter(product => product.isFavorite),
    filteredProducts: store.products.filter(product => {
      const { filters, searchQuery } = store
      
      // Фильтрация по поиску
      if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Фильтрация по цене
      if (filters.priceMin && product.price < filters.priceMin) return false
      if (filters.priceMax && product.price > filters.priceMax) return false
      
      // Фильтрация по состоянию
      if (filters.condition && filters.condition.length > 0 && !filters.condition.includes(product.condition)) {
        return false
      }
      
      // Фильтрация по местоположению
      if (filters.location && product.location !== filters.location) return false
      
      // Фильтрация по категории
      if (filters.category && store.selectedCategory?.slug !== filters.category) return false
      
      return true
    }),
    
    // Статистика
    totalProducts: store.products.length,
    totalFavorites: store.products.filter(product => product.isFavorite).length,
    categoriesWithCounts: store.categories.map(category => ({
      ...category,
      // Пересчитываем количество продуктов в реальном времени
      actualProductCount: store.products.filter(product => 
        // Логика определения принадлежности продукта к категории
        // Здесь должна быть ваша логика связывания продукта с категорией
        true // Placeholder
      ).length
    })),
  }
}

/**
 * Хук для работы с избранным
 */
export const useFavorites = () => {
  const { favorites, toggleFavorite } = useMarketplaceStore()
  const favoriteProducts = useMarketplaceStore(state => 
    state.products.filter(product => product.isFavorite)
  )
  
  return {
    favorites,
    favoriteProducts,
    toggleFavorite,
    isFavorite: (productId: string) => favorites.includes(productId),
    favoritesCount: favorites.length,
  }
}

/**
 * Хук для работы с поиском и фильтрами
 */
export const useSearch = () => {
  const { 
    searchQuery, 
    filters, 
    updateSearch, 
    applyFilters, 
    clearFilters 
  } = useMarketplaceStore()
  
  const filteredProducts = useMarketplaceSelectors().filteredProducts
  
  return {
    searchQuery,
    filters,
    filteredProducts,
    updateSearch,
    applyFilters,
    clearFilters,
    hasActiveFilters: Object.keys(filters).length > 0,
    resultsCount: filteredProducts.length,
  }
}

/**
 * Хук для работы с категориями
 */
export const useCategories = () => {
  const { 
    categories, 
    selectedCategory, 
    setSelectedCategory 
  } = useMarketplaceStore()
  
  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    clearCategory: () => setSelectedCategory(null),
    isSelectedCategory: (categoryId: string) => selectedCategory?.id === categoryId,
  }
}