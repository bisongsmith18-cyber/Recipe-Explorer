import { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import RecipeCard from '../components/RecipeCard'
import { getRecipesByIds, type RecipeSummary } from '../services/api'

type FavoritesProps = {
  favoriteIds: string[]
  favoriteIdSet: Set<string>
  onNavigateHome: () => void
  onOpenRecipe: (recipeId: string) => void
  onToggleFavorite: (recipeId: string) => void
}

function Favorites({
  favoriteIds,
  favoriteIdSet,
  onNavigateHome,
  onOpenRecipe,
  onToggleFavorite,
}: FavoritesProps) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      if (favoriteIds.length === 0) {
        setRecipes([])
        setErrorMessage('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const fetchedRecipes = await getRecipesByIds(favoriteIds)

        if (isMounted) {
          setRecipes(fetchedRecipes)

          if (fetchedRecipes.length === 0) {
            setErrorMessage('Saved recipes could not be loaded right now.')
          }
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Saved recipes could not be loaded right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadFavorites()

    return () => {
      isMounted = false
    }
  }, [favoriteIds])

  return (
    <section className="page favorites-page">
      <section className="favorites-header">
        <div className="favorites-copy">
          <span className="eyebrow">Favorites</span>
          <h1>My Favorites</h1>
        </div>
        <div className="favorites-tools">
          <button className="ghost-button" onClick={onNavigateHome} type="button">
            Browse More
          </button>
          <span>{favoriteIds.length} recipes saved</span>
        </div>
      </section>

      {isLoading ? (
        <div className="content-state tall">
          <Loader label="Gathering your favorites..." />
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="content-state error-state">
          <h3>Favorites are unavailable</h3>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && favoriteIds.length === 0 ? (
        <div className="content-state">
          <h3>No favorites yet</h3>
          <p>Save recipes from the home page and they will stay here after refresh.</p>
          <button className="primary-button" onClick={onNavigateHome} type="button">
            Browse recipes
          </button>
        </div>
      ) : null}

      {!isLoading && !errorMessage && recipes.length > 0 ? (
        <section className="recipe-grid favorites-grid">
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

export default Favorites