// Core widget configuration interface
export interface WidgetConfig {
  apiKey?: string
  theme?: 'light' | 'dark' | 'default' | 'premium'
  locale?: string
  debug?: boolean
}

// Widget initialization options
export interface InitOptions {
  retries?: number
  timeout?: number
  fallback?: HTMLElement | string
  onError?: (error: WidgetError) => void
  onSuccess?: (instance: WidgetInstance) => void
}

// Widget instance interface
export interface WidgetInstance {
  config: WidgetConfig
  root: import('react-dom/client').Root
  container: HTMLElement
  destroy: () => void
  update: (newConfig: Partial<WidgetConfig>) => void
  getHealth: () => WidgetHealth
}

// Widget error interface
export interface WidgetError extends Error {
  code: 'CONTAINER_NOT_FOUND' | 'INITIALIZATION_FAILED' | 'RENDER_ERROR' | 'TIMEOUT' | 'VALIDATION_ERROR'
  timestamp: number
  context?: Record<string, any>
}

// Widget health status
export interface WidgetHealth {
  isHealthy: boolean
  errors: WidgetError[]
  lastCheck: number
  uptime: number
}

// Clock component props
export interface ClockProps {
  format?: '12' | '24'
  showSeconds?: boolean
  showDate?: boolean
}

// Global window interface extensions
declare global {
  interface Window {
    initMyWidget: (
      config?: WidgetConfig,
      options?: InitOptions
    ) => Promise<WidgetInstance | null>
    
    // Optional error reporting function
    reportWidgetError?: (error: Error, errorInfo?: any) => void
    
    // Optional analytics tracking
    trackWidgetEvent?: (event: string, data?: Record<string, any>) => void
  }
}

export {}