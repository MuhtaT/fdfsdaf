"use client"

import { useState } from "react"
import TelegramSticker from "./telegram-sticker"

interface WelcomeScreenProps {
  onComplete: () => void
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      sticker: "DUCK_WAVE" as const,
      title: "Добро пожаловать!",
      subtitle: "Покупайте и продавайте всё что угодно в вашем городе",
    },
    {
      sticker: "DUCK_HEART" as const,
      title: "Находите лучшие предложения",
      subtitle: "Добавляйте товары в избранное и следите за изменениями цен",
    },
    {
      sticker: "DUCK_PLANE" as const,
      title: "Продавайте легко",
      subtitle: "Размещайте объявления за несколько минут",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center z-50 p-6">
      {/* Sticker */}
      <div className="mb-8 transform transition-transform duration-500 hover:scale-105">
        <TelegramSticker 
          sticker={currentStepData.sticker} 
          size={180}
          className="drop-shadow-lg"
        />
      </div>

      {/* Content */}
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
          {currentStepData.title}
        </h1>

        <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed mb-12">
          {currentStepData.subtitle}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex space-x-3 mb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentStep 
                ? "bg-avito-primary scale-125" 
                : index < currentStep
                ? "bg-avito-primary/60"
                : "bg-neutral-300 dark:bg-neutral-600"
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex space-x-4 w-full max-w-sm">
        {currentStep > 0 && (
          <button
            onClick={handlePrevious}
            className="flex-1 px-6 py-3 border-2 border-avito-primary text-avito-primary rounded-xl font-medium hover:bg-avito-primary/5 active:scale-95 transition-all duration-200"
          >
            Назад
          </button>
        )}

        <button
          onClick={handleNext}
          className="flex-1 px-8 py-3 bg-avito-primary text-white rounded-xl font-medium hover:bg-avito-primary/90 active:scale-95 transition-all duration-200 shadow-lg"
        >
          {currentStep === steps.length - 1 ? "Начать использовать" : "Далее"}
        </button>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="mt-6 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-200 text-sm"
      >
        Пропустить введение
      </button>
    </div>
  )
}