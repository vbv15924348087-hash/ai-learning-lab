import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './app/App'
import { PagesAnchorSupport } from './app/PagesAnchorSupport'
import './styles.css'

const isGitHubPages = import.meta.env.VITE_GITHUB_PAGES === 'true'
const Router = isGitHubPages ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      {isGitHubPages && <PagesAnchorSupport />}
      <App />
    </Router>
  </StrictMode>,
)
