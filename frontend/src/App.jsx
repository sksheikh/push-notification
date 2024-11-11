import { useState } from 'react'
import './App.css'
import NotificationSystem from './components/NotificationSystem'

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log(apiBaseUrl);


  return (
    <>
      <div>
        <h2>All notifications</h2>
        <NotificationSystem />
      </div>
    </>
  )
}

export default App
