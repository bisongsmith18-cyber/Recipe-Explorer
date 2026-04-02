import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import RecipeDetail from './pages/RecipeDetail'

type Route =
  | { name: 'home' }
  | { name: 'favorites' }
  | { name: 'recipe'; recipeId: string }

type ListRoute = Extract<Route, { name: 'home' | 'favorites' }>

const FAVORITES_STORAGE_KEY = 'recipe-explorer-favorites'
const THEME_STORAGE_KEY = 'recipe-explorer-theme'
const TRANSITION_DURATION_MS = 180

function parseRoute(hash: string): Route {
  const cleanedHash = hash.replace(/^#/, '') || '/'
  const [path] = cleanedHash.split('?')
  const segments = path.split('/').filter(Boolean)

  if (segments[0] === 'favorites') {
    return { name: 'favorites' }
  }

  if (segments[0] === 'recipe' && segments[1]) {
    return { name: 'recipe', recipeId: decodeURIComponent(segments[1]) }
  }

  return { name: 'home' }
}

function getRouteHash(route: Route): string {
  if (route.name === 'favorites') {
    return '#/favorites'
  }

  if (route.name === 'recipe') {
    return `#/recipe/${encodeURIComponent(route.recipeId)}`
  }

  return '#/'
}

function readFavoriteIds(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    const parsedValue = storedValue ? (JSON.parse(storedValue) as string[]) : []
    return [...new Set(parsedValue.filter(Boolean))]
  } catch {
    return []
  }
}

function readThemePreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
  const [transitionState, setTransitionState] = useState<'idle' | 'enter' | 'exit'>(
    'enter',
  )
  const [favorites, setFavorites] = useState<string[]>(() => readFavoriteIds())
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readThemePreference())
  const [lastListRoute, setLastListRoute] = useState<ListRoute>({ name: 'home' })
  const [globalSearch, setGlobalSearch] = useState('')

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/')
    }

    const syncRoute = () => {
      const nextRoute = parseRoute(window.location.hash)

      if (nextRoute.name === 'home' || nextRoute.name === 'favorites') {
        setLastListRoute(nextRoute)
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
      setRoute(nextRoute)
      setTransitionState('enter')
    }

    window.addEventListener('hashchange', syncRoute)

    return () => {
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  useEffect(() => {
    if (transitionState !== 'enter') {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setTransitionState('idle')
    }, TRANSITION_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [transitionState])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const favoriteIds = useMemo(() => new Set(favorites), [favorites])

  const navigate = (nextRoute: Route) => {
    const targetHash = getRouteHash(nextRoute)

    if (window.location.hash === targetHash) {
      return
    }

    if (route.name === 'home' || route.name === 'favorites') {
      setLastListRoute(route)
    }

    setTransitionState('exit')

    window.setTimeout(() => {
      window.location.hash = targetHash
    }, TRANSITION_DURATION_MS)
  }

  const navigateHome = () => {
    if (window.location.hash === '#/' || (!window.location.hash && route.name === 'home')) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    navigate({ name: 'home' })
  }

  const toggleFavorite = (recipeId: string) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(recipeId)
        ? currentFavorites.filter((id) => id !== recipeId)
        : [...currentFavorites, recipeId],
    )
  }

  const renderPage = () => {
    if (route.name === 'favorites') {
      return (
        <Favorites
          favoriteIds={favorites}
          favoriteIdSet={favoriteIds}
          onNavigateHome={navigateHome}
          onOpenRecipe={(recipeId) => navigate({ name: 'recipe', recipeId })}
          onToggleFavorite={toggleFavorite}
        />
      )
    }

    if (route.name === 'recipe') {
      return (
        <RecipeDetail
          favoriteIdSet={favoriteIds}
          recipeId={route.recipeId}
          onBack={() => navigate(lastListRoute)}
          onToggleFavorite={toggleFavorite}
        />
      )
    }

    return (
      <Home
        favoriteIdSet={favoriteIds}
        globalSearch={globalSearch}
        onNavigateFavorites={() => navigate({ name: 'favorites' })}
        onOpenRecipe={(recipeId) => navigate({ name: 'recipe', recipeId })}
        onSearchChange={setGlobalSearch}
        onToggleFavorite={toggleFavorite}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={navigateHome} type="button">
          <span className="brand-mark" />
          <span className="brand-copy">
            <strong>Saffron & Sage</strong>
            <small>New recipes</small>
          </span>
        </button>

        <div className="topbar-actions">
          <label className="topbar-search">
            <span className="topbar-search-icon">⌕</span>
            <input
              aria-label="Search recipes"
              onChange={(event) => {
                setGlobalSearch(event.target.value)
                if (route.name !== 'home') {
                  navigate({ name: 'home' })
                }
              }}
              placeholder="search recipes..."
              type="search"
              value={globalSearch}
            />
          </label>

          <nav className="topbar-nav" aria-label="Primary">
            <button
              className={route.name === 'home' ? 'is-active' : undefined}
              onClick={navigateHome}
              type="button"
            >
              Home
            </button>
            <button
              className={route.name === 'favorites' ? 'is-active' : undefined}
              onClick={() => navigate({ name: 'favorites' })}
              type="button"
            >
              Favorites
              <span className="nav-badge">{favorites.length}</span>
            </button>
          </nav>

          <button
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="theme-toggle"
            onClick={() =>
              setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
            }
            type="button"
          >
            <span className={`theme-toggle-core is-${theme}`} />
          </button>
        </div>
      </header>

      <main className={`page-shell is-${transitionState}`}>{renderPage()}</main>
    </div>
  )
}

export default App
