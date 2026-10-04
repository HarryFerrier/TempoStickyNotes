import { AppHeader } from './components/AppHeader/AppHeader'
import { Board } from './components/Board/Board'
import { NotesPanel } from './components/NotesPanel/NotesPanel'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    // Below the brief's minimum viewport the page scrolls instead of squashing the layout.
    <div className="flex h-dvh min-h-[768px] min-w-[1024px] flex-col">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} saveState={null} />
      <div className="flex min-h-0 flex-1">
        <Board />
        <NotesPanel noteCount={0} />
      </div>
    </div>
  )
}

export default App
