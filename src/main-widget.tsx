import React from 'react'
import ReactDOM from 'react-dom/client'
import Clock from './components/Clock'
import MyWidget from './components/MyWidget'
import ErrorBoundary from './components/ErrorBoundary'
import type { WidgetConfig, InitOptions, WidgetInstance, WidgetError } from './types/widget'
import './index.css'

// Export components for external use
export { default as Clock } from './components/Clock'
export { default as MyWidget } from './components/MyWidget'
export { default as ErrorBoundary } from './components/ErrorBoundary'

// Utility function to create widget error
function createWidgetError(
  code: WidgetError['code'], 
  message: string, 
  context?: Record<string, any>
): WidgetError {
  const error = new Error(message) as WidgetError
  error.code = code
  error.timestamp = Date.now()
  error.context = context
  return error
}

// Enhanced widget initialization with robust error handling
export async function initMyWidget(
  config: WidgetConfig = {},
  options: InitOptions = {}
): Promise<WidgetInstance | null> {
  const { 
    retries = 3, 
    timeout = 5000, 
    fallback,
    onError,
    onSuccess 
  } = options

  let lastError: WidgetError | null = null

  // Validate configuration
  try {
    validateConfig(config)
  } catch (error) {
    const validationError = createWidgetError(
      'VALIDATION_ERROR',
      `Invalid configuration: ${error instanceof Error ? error.message : 'Unknown validation error'}`,
      { config }
    )
    onError?.(validationError)
    return null
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const initPromise = new Promise<WidgetInstance>((resolve, reject) => {
        try {
          const container = document.getElementById('my-widget-container')
          
          if (!container) {
            reject(createWidgetError(
              'CONTAINER_NOT_FOUND',
              'Element with ID "my-widget-container" not found',
              { attempt }
            ))
            return
          }

          if (!document.contains(container)) {
            reject(createWidgetError(
              'CONTAINER_NOT_FOUND',
              'Container element is not attached to DOM',
              { attempt }
            ))
            return
          }

          const root = ReactDOM.createRoot(container)
          const startTime = Date.now()
          
          root.render(
            <ErrorBoundary
              onError={(error, errorInfo) => {
                const renderError = createWidgetError(
                  'RENDER_ERROR',
                  error.message,
                  { errorInfo, attempt }
                )
                reject(renderError)
              }}
            >
              <MyWidget config={config} />
            </ErrorBoundary>
          )

          // Create widget instance
          const instance: WidgetInstance = {
            config,
            root,
            container,
            destroy: () => {
              root.unmount()
              container.innerHTML = ''
            },
            update: (newConfig: Partial<WidgetConfig>) => {
              const updatedConfig = { ...config, ...newConfig }
              root.render(
                <ErrorBoundary
                  onError={(error) => {
                    console.error('Widget update error:', error)
                  }}
                >
                  <MyWidget config={updatedConfig} />
                </ErrorBoundary>
              )
            },
            getHealth: () => ({
              isHealthy: document.contains(container) && container.children.length > 0,
              errors: [],
              lastCheck: Date.now(),
              uptime: Date.now() - startTime
            })
          }
          
          resolve(instance)
        } catch (error) {
          reject(createWidgetError(
            'INITIALIZATION_FAILED',
            error instanceof Error ? error.message : 'Unknown initialization error',
            { attempt }
          ))
        }
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(createWidgetError(
            'TIMEOUT',
            `Widget initialization timeout after ${timeout}ms`,
            { attempt, timeout }
          ))
        }, timeout)
      })

      const instance = await Promise.race([initPromise, timeoutPromise])
      onSuccess?.(instance)
      return instance

    } catch (error) {
      lastError = error as WidgetError
      console.warn(`Widget initialization attempt ${attempt}/${retries} failed:`, error)
      
      if (attempt < retries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  // All retries failed - show fallback if provided
  if (fallback) {
    const container = document.getElementById('my-widget-container')
    if (container) {
      if (typeof fallback === 'string') {
        container.innerHTML = fallback
      } else {
        container.innerHTML = ''
        container.appendChild(fallback.cloneNode(true))
      }
    }
  }

  if (lastError) {
    onError?.(lastError)
  }
  
  return null
}

// Legacy function for backward compatibility
export function renderWidget(container: HTMLElement, props?: any) {
  const root = ReactDOM.createRoot(container)
  root.render(React.createElement(Clock, props))
  return root
}

// Basic configuration validation
function validateConfig(config: WidgetConfig): void {
  if (config.theme && !['light', 'dark', 'default', 'premium'].includes(config.theme)) {
    throw new Error(`Invalid theme: ${config.theme}`)
  }
  
  if (config.apiKey && typeof config.apiKey !== 'string') {
    throw new Error('API key must be a string')
  }
  
  if (config.locale && typeof config.locale !== 'string') {
    throw new Error('Locale must be a string')
  }
}

// Expose enhanced function globally
if (typeof window !== 'undefined') {
  (window as any).initMyWidget = initMyWidget
}

// Auto-render for backward compatibility
if (typeof document !== 'undefined') {
  const container = document.getElementById('widget-container')
  if (container) {
    renderWidget(container)
  }
}

// Default export for the widget
export default {
  Clock,
  MyWidget,
  ErrorBoundary,
  renderWidget,
  initMyWidget
}