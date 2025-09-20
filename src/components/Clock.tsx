import { useState, useEffect } from 'react'
import './Clock.css'

interface ClockProps {
  format?: '12' | '24'
  showSeconds?: boolean
  showDate?: boolean
}

const Clock = ({ format = '12', showSeconds = true, showDate = true }: ClockProps) => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12'
    }

    if (showSeconds) {
      options.second = '2-digit'
    }

    return date.toLocaleTimeString('en-US', options)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="clock-widget">
      <div className="clock-time">
        {formatTime(time)}
      </div>
      {showDate && (
        <div className="clock-date">
          {formatDate(time)}
        </div>
      )}
    </div>
  )
}

export default Clock