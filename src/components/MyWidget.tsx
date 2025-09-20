import React from 'react'
import './MyWidget.css'

// TypeScript interface for the config prop
interface WidgetConfig {
  apiKey?: string
  theme?: string
}

// Props interface for the MyWidget component
interface MyWidgetProps {
  config: WidgetConfig
}

const MyWidget: React.FC<MyWidgetProps> = ({ config }) => {
  const { apiKey, theme = 'default' } = config

  return (
    <div className="my-widget">
      <h1>Current Theme: {theme}</h1>
      {apiKey && (
        <p className="api-info">
          API Key configured: {apiKey.substring(0, 8)}...
        </p>
      )}
    </div>
  )
}

export default MyWidget