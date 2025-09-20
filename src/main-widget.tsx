import React from 'react'
import ReactDOM from 'react-dom/client'
import Clock from './components/Clock'
import MyWidget from './components/MyWidget'
import './index.css'

// Export components for external use
export { default as Clock } from './components/Clock'
export { default as MyWidget } from './components/MyWidget'

// Create a function to render the widget
export function renderWidget(container: HTMLElement, props?: any) {
  const root = ReactDOM.createRoot(container)
  root.render(React.createElement(Clock, props))
  return root
}

// Auto-render if there's a container with id 'widget-container'
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
  renderWidget
}