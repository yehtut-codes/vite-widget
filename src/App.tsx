import Clock from './components/Clock'
import MyWidget from './components/MyWidget'
import './App.css'

function App() {
  // Example configurations for MyWidget
  const config1 = {
    theme: 'dark',
    apiKey: 'sk-1234567890abcdef'
  }

  const config2 = {
    theme: 'light'
  }

  return (
    <div className="app">
      <h1>Widget Examples</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Clock Widget</h2>
        <Clock />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>My Widget (Dark Theme with API Key)</h2>
        <MyWidget config={config1} />
      </div>

      <div>
        <h2>My Widget (Light Theme)</h2>
        <MyWidget config={config2} />
      </div>
    </div>
  )
}

export default App
