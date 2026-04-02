import { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import RecipeCard from '../components/RecipeCard'
import SearchBar from '../components/SearchBar'
import { getRecipeCategories, getRecipes, type RecipeSummary } from '../services/api'

type HomeProps = {
  favoriteIdSet: Set<string>
  globalSearch: string
  onNavigateFavorites: () => void
  onOpenRecipe: (recipeId: string) => void
  onSearchChange: (value: string) => void
  onToggleFavorite: (recipeId: string) => void
}

function Home({
  favoriteIdSet,
  globalSearch,
  onNavigateFavorites,
  onOpenRecipe,
  onSearchChange,
  onToggleFavorite,
}: HomeProps) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [categoryWarning, setCategoryWarning] = useState('')
  const showEditorialLayout = !debouncedSearch.trim() && selectedCategory === 'All'
  const featuredRecipes = recipes.slice(0, 3)
  const bannerRecipe = recipes[3] ?? recipes[0]
  const previewRecipes = Array.from({ length: 3 }, (_, index) => {
    return recipes[index + 3] ?? recipes[index] ?? recipes[0]
  }).filter(Boolean)

  const triggerSearch = () => {
    setDebouncedSearch(searchValue)
  }

  useEffect(() => {
    setSearchValue(globalSearch)
    setDebouncedSearch(globalSearch)
  }, [globalSearch])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchValue])

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const fetchedCategories = await getRecipeCategories()

        if (isMounted) {
          setCategories(fetchedCategories)
          setCategoryWarning('')
        }
      } catch {
        if (isMounted) {
          setCategoryWarning('Category filters are temporarily unavailable.')
        }
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadRecipes = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const fetchedRecipes = await getRecipes(debouncedSearch, selectedCategory)

        if (isMounted) {
          setRecipes(fetchedRecipes)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Recipe search failed. Please try again in a moment.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsBootstrapping(false)
        }
      }
    }

    void loadRecipes()

    return () => {
      isMounted = false
    }
  }, [debouncedSearch, selectedCategory])

  return (
    <section className="page home-page">
      <section className="editorial-hero">
        <div className="hero-copy">
          <span className="eyebrow">Daily menu collection</span>
          <h1>
            What are we
            <br />
            <span className="accent-text">crafting</span> today?
          </h1>
        </div>

        <div className="hero-actions">
          <button className="primary-button" onClick={onNavigateFavorites} type="button">
            My favorites
          </button>
          <div className="hero-stat">
            <strong>{favoriteIdSet.size}</strong>
            <span>saved dishes</span>
          </div>
        </div>
      </section>

      <SearchBar
        categories={categories}
        isCategoryDisabled={categories.length === 0}
        onCategoryChange={setSelectedCategory}
        onSearchChange={(value) => {
          setSearchValue(value)
          onSearchChange(value)
        }}
        onSearchSubmit={triggerSearch}
        searchValue={searchValue}
        selectedCategory={selectedCategory}
      />

      <section className="results-toolbar">
        <div>
          <span className="section-kicker">Trending Recipes</span>
          <h2>Fresh picks for your table</h2>
          {categoryWarning ? <p>{categoryWarning}</p> : null}
        </div>
        <span className="results-summary">{recipes.length} recipes</span>
      </section>

      {isLoading ? (
        <div className={isBootstrapping ? 'content-state tall' : 'content-state'}>
          <Loader label={isBootstrapping ? 'Setting the table...' : 'Refreshing recipes...'} />
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="content-state error-state">
          <h3>Something went off heat</h3>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && recipes.length === 0 ? (
        <div className="content-state">
          <h3>No matching recipes</h3>
          <p>Try a broader search or switch back to all categories.</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && recipes.length > 0 && showEditorialLayout ? (
        <>
          <section className="recipe-grid">
            {featuredRecipes.map((recipe) => (
              <RecipeCard
                isFavorite={favoriteIdSet.has(recipe.id)}
                key={recipe.id}
                onOpen={() => onOpenRecipe(recipe.id)}
                onToggleFavorite={() => onToggleFavorite(recipe.id)}
                recipe={recipe}
              />
            ))}
          </section>

          <section className="recipe-grid recipe-grid-ghosts" aria-label="More recipes coming">
            {previewRecipes.map((recipe, index) => (
              <article className="recipe-card recipe-card-ghost" key={`${recipe.id}-${index}`}>
                <div className="ghost-media">
                  <img
                    alt={recipe.name}
                    className="ghost-media-image"
                    loading="lazy"
                    src={recipe.image}
                  />
                </div>
                <div className="recipe-card-body">
                  <span className="recipe-pill">{recipe.category}</span>
                  <h3 className="ghost-title">{recipe.name}</h3>
                  <p className="ghost-description">View recipe</p>
                </div>
              </article>
            ))}
          </section>

          <section className="cta-banner">
            <div className="cta-copy">
              <h2>Join our culinary inner circle.</h2>
              <p>
                Get exclusive recipes, seasonal tips, and chef notes delivered weekly.
              </p>
              <div className="cta-actions">
                <button className="ghost-button" type="button">
                  inspiration@hub.com
                </button>
                <button className="dark-button" type="button">
                  Sign Me Up
                </button>
              </div>
            </div>

            <div className="cta-photo-frame">
              <img alt={bannerRecipe.name} src={bannerRecipe.image} />
            </div>
          </section>
        </>
      ) : null}

      {!isLoading && !errorMessage && recipes.length > 0 && !showEditorialLayout ? (
        <section className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              isFavorite={favoriteIdSet.has(recipe.id)}
              key={recipe.id}
              onOpen={() => onOpenRecipe(recipe.id)}
              onToggleFavorite={() => onToggleFavorite(recipe.id)}
              recipe={recipe}
            />
          ))}
        </section>
      ) : null}
    </section>
  )
}

export default Home