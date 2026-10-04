import { useEffect, useState } from 'react'
import './styles/tokens.css'
import './App.css'

type ThemeMode = 'light' | 'dark'

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem('tempo-theme')
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('tempo-theme', theme)
  }, [theme])

  return (
    <div className="app-shell">
      <header className="topbar" aria-label="Sticky Notes header">
        <div className="brand" aria-label="Tempo Sticky Notes app title">
          <span className="brand-mark" aria-hidden="true">
            ▣
          </span>
          <span className="brand-text">Sticky Notes</span>
        </div>

        <div className="header-actions">
          <div className="save-status" aria-live="polite">
            <span className="status-indicator status-success" aria-hidden="true" />
            <span>All changes saved</span>
          </div>

          <button type="button" className="btn-edge primary-button">
            New note
          </button>

          <button
            type="button"
            className="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === 'dark' ? 'light' : 'dark',
              )
            }
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
          </button>
        </div>
      </header>

      <main className="board board-grid" role="main" aria-label="Sticky notes board">
        <div className="empty-board-hint">
          <div className="board-illustration" aria-hidden="true">
            <span className="ghost-box" />
            <span className="ghost-box ghost-box-secondary" />
          </div>

          <h1 className="empty-state-title">Drag anywhere to draw a note</h1>
          <p className="empty-state-copy">
            The outline you drag sets its size and position. New note adds one at the
            default size.
          </p>
        </div>

        <div className="trash-zone" aria-label="Delete notes">
          <span className="trash-label">Release to delete</span>
        </div>
      </main>
    </div>
  )
}

export default App
