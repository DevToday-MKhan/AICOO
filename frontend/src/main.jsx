import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ShopifyProvider from './ShopifyProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShopifyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ShopifyProvider>
  </StrictMode>,
)
