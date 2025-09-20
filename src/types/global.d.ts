// Type declarations for the global initMyWidget function

interface WidgetConfig {
  apiKey?: string;
  theme?: string;
}

declare global {
  interface Window {
    initMyWidget: (config?: WidgetConfig) => import('react-dom/client').Root | null;
  }
  
  function initMyWidget(config?: WidgetConfig): import('react-dom/client').Root | null;
}

export {};