import crypto from 'crypto'

/**
 * Генерация соли для пароля
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Хеширование пароля с солью
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

/**
 * Проверка пароля
 */
export function verifyPassword(password: string, salt: string, hashedPassword: string): boolean {
  const hash = hashPassword(password, salt)
  return hash === hashedPassword
}

/**
 * Генерация ключа шифрования из пароля
 */
export function deriveKeyFromPassword(password: string, salt: string): Buffer {
  return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256')
}

/**
 * Шифрование данных
 */
export function encryptData(data: string, password: string, salt?: string): { 
  encrypted: string
  salt: string
  iv: string
} {
  const actualSalt = salt || generateSalt()
  const key = deriveKeyFromPassword(password, actualSalt)
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return {
    encrypted,
    salt: actualSalt,
    iv: iv.toString('hex')
  }
}

/**
 * Расшифровка данных
 */
export function decryptData(
  encryptedData: string, 
  password: string, 
  salt: string, 
  iv: string
): string | null {
  try {
    const key = deriveKeyFromPassword(password, salt)
    const ivBuffer = Buffer.from(iv, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer)
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Ошибка расшифровки:', error)
    return null
  }
}

/**
 * Генерация безопасного токена сессии
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Проверка надежности пароля
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  // Минимальная длина
  if (password.length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов')
  } else {
    score += 1
  }

  // Наличие букв
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Пароль должен содержать буквы')
  } else {
    score += 1
  }

  // Наличие цифр
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать цифры')
  } else {
    score += 1
  }

  // Дополнительные проверки для увеличения надежности
  if (/[A-Z]/.test(password)) score += 0.5 // Заглавные буквы
  if (/[a-z]/.test(password)) score += 0.5 // Строчные буквы
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1 // Спецсимволы
  if (password.length >= 8) score += 0.5 // Дополнительная длина
  if (password.length >= 12) score += 0.5 // Еще больше длина

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5) // Максимальный балл 5
  }
} 