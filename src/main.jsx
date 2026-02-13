import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router' // add import for BrowserRouter
import { UserProvider } from './contexts/UserContext.jsx';

import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx';

// Wrap the App component with the BrowserRouter component to enable
// enable route handling throughout your application.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ThemeProvider>
        <App />
        </ThemeProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
)