/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// Создаем __dirname для ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Переменные окружения
const isDev = process.env.NODE_ENV !== 'production';
const isAnalyze = process.env.ANALYZE === 'true';
const isExport = process.env.EXPORT === 'true';
const isTelegram = process.env.TELEGRAM_BUILD === 'true';

const nextConfig = {
  // Настройки для разработки - только в dev режиме
  ...(isDev && {
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
  
  // Оптимизированные настройки изображений для Telegram WebApp
  images: {
    unoptimized: isTelegram || isExport,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    domains: [
      't.me',
      'telegram.org',
      'core.telegram.org',
    ],
    minimumCacheTTL: 60,
  },

  // Экспериментальные функции
  experimental: {    
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Заголовки безопасности и кэширования
  async headers() {
    return [
      // Статические ресурсы Next.js
      {
        source: '/_next/static/:path*',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable' 
          },
        ],
      },
      // Изображения
      {
        source: '/images/:path*',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=86400' 
          },
        ],
      },
      // Основные страницы
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://telegram.org",
              "connect-src 'self' https://api.telegram.org",
              "frame-ancestors 'self' https://web.telegram.org",
            ].join('; ')
          },
        ],
      },
      // API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },

  // Переписывания для SPA
  async rewrites() {
    return [
      {
        source: '/telegram/:path*',
        destination: '/:path*',
      },
    ];
  },

  // Webpack конфигурация
  webpack: (config, { dev, isServer }) => {
    // Оптимизации для production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          telegram: {
            name: 'telegram',
            test: /[\\/]node_modules[\\/](@telegram-apps|@twa-dev)[\\/]/,
            priority: 40,
          },
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 30,
          },
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            priority: 20,
          },
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'all',
          },
        },
      };
    }

    // Алиасы
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/types': path.resolve(__dirname, 'types'),
      '@/stores': path.resolve(__dirname, 'stores'),
    };

    // Поддержка .mjs файлов
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Bundle analyzer
    if (isAnalyze) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }

    return config;
  },

  // Настройки для статического экспорта
  ...(isExport && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),

  // Компилятор
  compiler: {
    removeConsole: !isDev ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Переменные окружения
  env: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    BUILD_ID: `${Date.now()}`,
  },

  // Основные настройки
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  trailingSlash: false,

  // Build ID
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;