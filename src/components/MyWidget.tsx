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

  const handleDecrement = () => {
    setCount(prevCount => Math.max(0, prevCount - 1))
  }

  const handleReset = () => {
    setCount(0)
  }

  return (
    <div className={styles.widget}>
      <h1>🎯 Interactive Widget</h1>
      <p className="theme-info">Current Theme: <strong>{theme}</strong></p>
      
      <div className="counter-section">
        <h2>🔢 Counter Function</h2>
        <div className="counter-display">
          <span className="count-number">{count}</span>
        </div>
        
        <div className="counter-controls">
          <button className="btn-decrement" onClick={handleDecrement} title="Decrease count">
            ➖ Decrease
          </button>
          <button className="btn-increment" onClick={handleIncrement} title="Increase count">
            ➕ Increase
          </button>
          <button className="btn-reset" onClick={handleReset} title="Reset to zero">
            🔄 Reset
          </button>
        </div>
        
        <div className="counter-stats">
          <small>
            Status: {count === 0 ? 'Zero' : count < 10 ? 'Low' : count < 50 ? 'Medium' : 'High'} 
            | Clicks: {count}
          </small>
        </div>
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