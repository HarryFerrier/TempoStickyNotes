import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

// Also read by the inline script in index.html, which applies the theme before first paint.
const STORAGE_KEY = 'tempo-theme'

function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // Storage can be unavailable (private browsing, blocked site data); fall back to the OS setting.
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  // Only an explicit choice is saved, so users who never toggle keep following the OS setting.
  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The choice still applies for this session.
    }
  }, [theme])

  return { theme, toggleTheme }
}
