import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { captureAttribution } from './utils/attribution'

// index.html carries a default title/description/og set for crawlers and link
// scrapers that don't run JS. Once the app runs, each page sets its own through
// Helmet, so drop the defaults to avoid duplicate tags (react-helmet-async only
// manages the tags it created itself).
document.head.querySelectorAll('[data-static-seo]').forEach((el) => el.remove())

captureAttribution()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
