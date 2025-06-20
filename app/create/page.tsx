"use client"

import { useState } from "react"
import { Camera, X, MapPin } from "lucide-react"
import Image from "next/image"
import Header from "@/components/navigation/Header"
import LoadingScreen from "@/components/ui/loading-screen"
import SuccessScreen from "@/components/ui/success-screen"
import ErrorScreen from "@/components/ui/error-screen"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

interface FormData {
  title: string
  description: string
  price: string
  category: string
  condition: string
  location: string
  images: string[]
  contactPhone: string
  contactName: string
}

const categories = [
  { id: "transport", name: "Транспорт" },
  { id: "real-estate", name: "Недвижимость" },
  { id: "electronics", name: "Электроника" },
  { id: "clothing", name: "Одежда" },
  { id: "hobby", name: "Хобби и отдых" },
  { id: "kids", name: "Детские товары" },
  { id: "services", name: "Услуги" },
  { id: "jobs", name: "Работа" },
]

const conditions = [
  { id: "new", name: "Новое" },
  { id: "excellent", name: "Отличное" },
  { id: "good", name: "Хорошее" },
  { id: "fair", name: "Удовлетворительное" },
]

export default function CreateAdPage() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    images: [],
    contactPhone: "",
    contactName: "",
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const { telegramTheme } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageAdd = () => {
    const newImage = `/placeholder.svg?height=200&width=200&text=Photo${formData.images.length + 1}`
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }))
  }

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Симуляция отправки
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Случайный результат для демо
    const success = Math.random() > 0.3

    setIsSubmitting(false)

    if (success) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.category && formData.images.length > 0
      case 2:
        return formData.description && formData.price && formData.condition
      case 3:
        return formData.location && formData.contactPhone && formData.contactName
      default:
        return false
    }
  }

  if (isSubmitting) {
    return (
      <LoadingScreen
        title="Публикуем объявление..."
        subtitle="Пожалуйста, подождите. Это займёт всего несколько секунд."
      />
    )
  }

  if (showSuccess) {
    return (
      <SuccessScreen
        title="Объявление опубликовано!"
        subtitle="Ваше объявление успешно размещено и уже доступно для просмотра"
        sticker="DUCK_PLANE"
        buttonText="Перейти к объявлениям"
        redirectPath="/my-ads"
      />
    )
  }

  if (showError) {
    return (
      <ErrorScreen
        title="Не удалось опубликовать"
        subtitle="Произошла ошибка при публикации объявления. Проверьте подключение к интернету и попробуйте снова."
        onButtonClick={() => setShowError(false)}
      />
    )
  }

  return (
    <div className="h-screen max-h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
      <Header showBackButton title="Подать объявление" theme={safeTheme} />

      <main className="pt-16 pb-24">
        {/* Progress Steps */}
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-avito-primary text-white"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-avito-primary" : "bg-neutral-200 dark:bg-neutral-700"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {currentStep === 1 && "Основная информация"}
              {currentStep === 2 && "Описание и цена"}
              {currentStep === 3 && "Контакты и публикация"}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Photos */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Фотографии</h3>
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 10 && (
                    <button
                      onClick={handleImageAdd}
                      className="aspect-square border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg flex flex-col items-center justify-center hover:border-avito-primary hover:bg-avito-primary/5 transition-colors"
                    >
                      <Camera className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mb-2" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Добавить</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  Добавьте до 10 фотографий. Первая фотография будет главной.
                </p>
              </div>

              {/* Title */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Название объявления *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Например: iPhone 15 Pro Max 256GB"
                  className="w-full px-3 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
                  maxLength={70}
                />
                <div className="text-right text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {formData.title.length}/70
                </div>
              </div>

              {/* Category */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Категория *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleInputChange("category", category.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.category === category.id
                          ? "border-avito-primary bg-avito-primary/5 text-avito-primary"
                          : "border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description and Price */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Расскажите о товаре: состояние, особенности, причина продажи..."
                  rows={6}
                  className="w-full px-3 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none resize-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
                  maxLength={3000}
                />
                <div className="text-right text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {formData.description.length}/3000
                </div>
              </div>

              {/* Price */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Цена *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-3 pr-12 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
                    ₽
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Состояние *
                </label>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <button
                      key={condition.id}
                      onClick={() => handleInputChange("condition", condition.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        formData.condition === condition.id
                          ? "border-avito-primary bg-avito-primary/5 text-avito-primary"
                          : "border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {condition.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contacts */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Location */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Местоположение *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Город, район"
                    className="w-full px-3 py-3 pl-10 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Контактная информация</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange("contactName", e.target.value)}
                      placeholder="Ваше имя"
                      className="w-full px-3 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className="w-full px-3 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Предварительный просмотр</h3>
                <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-3">
                  <div className="flex space-x-3">
                    {formData.images[0] && (
                      <Image
                        src={formData.images[0] || "/placeholder.svg"}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1 text-neutral-800 dark:text-neutral-200">
                        {formData.title || "Название объявления"}
                      </h4>
                      <div className="text-avito-primary font-bold mb-1">
                        {formData.price ? `${Number(formData.price).toLocaleString("ru-RU")} ₽` : "Цена"}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formData.location || "Местоположение"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 pb-safe">
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 border-2 border-avito-primary text-avito-primary rounded-xl font-medium hover:bg-avito-primary/5 transition-colors"
            >
              Назад
            </button>
          )}
          <button
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep(currentStep + 1)
              } else {
                handleSubmit()
              }
            }}
            disabled={!isStepValid(currentStep)}
            className="flex-1 bg-avito-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep < 3 ? "Далее" : "Опубликовать"}
          </button>
        </div>
      </div>
    </div>
  )
}
