import React, { useState } from 'react'
import styles from './MyWidget.module.css'

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
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    setCount(prevCount => prevCount + 1)
  }

  return (
    <div className={styles.widget}>
      <h1>Current Theme: {theme}</h1>
      
      <div className="count-section">
        <p className="count-display">Count: {count}</p>
        <button className="increment-button" onClick={handleIncrement}>
          Increment Count
        </button>
      </div>

      {apiKey && (
        <p className="api-info">
          API Key configured: {apiKey.substring(0, 8)}...
        </p>
      )}
    </div>
  )
}

export default MyWidget