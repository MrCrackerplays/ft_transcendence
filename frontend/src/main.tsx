import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import MyHomePage from './views/home/home'
import MyNavBar from './hooks/navbar/navbar'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {<MyHomePage />}
  </React.StrictMode>,
)