import { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import { getRecipeById, type RecipeDetail as RecipeDetailType } from '../services/api'

type RecipeDetailProps = {
  favoriteIdSet: Set<string>
  onBack: () => void
  onToggleFavorite: (recipeId: string) => void
  recipeId: string
}

function RecipeDetail({
  favoriteIdSet,
  onBack,
  onToggleFavorite,
  recipeId,
}: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadRecipe = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const fetchedRecipe = await getRecipeById(recipeId)

        if (isMounted) {
          setRecipe(fetchedRecipe)
        }
      } catch {
        if (isMounted) {
          setRecipe(null)
          setErrorMessage(
            'We could not load this recipe. Please head back and try another one.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadRecipe()

    return () => {
      isMounted = false
    }
  }, [recipeId])

  if (isLoading) {
    return (
      <section className="page detail-page">
        <div className="content-state tall">
          <Loader label="Plating the recipe..." />
        </div>
      </section>
    )
  }

  if (errorMessage || !recipe) {
    return (
      <section className="page detail-page">
        <div className="content-state error-state">
          <h3>Recipe unavailable</h3>
          <p>{errorMessage || 'This recipe is currently unavailable.'}</p>
          <button className="primary-button" onClick={onBack} type="button">
            Back to recipes
          </button>
        </div>
      </section>
    )
  }

  const instructionSteps = recipe.instructions
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter(Boolean)

  const displaySteps =
    instructionSteps.length > 0 ? instructionSteps : [recipe.instructions.trim()].filter(Boolean)

  const summaryText =
    displaySteps[0] ??
    'Follow the ingredient list and preparation steps to bring this recipe together.'

  return (
    <section className="page detail-page">
      <button className="back-button" onClick={onBack} type="button">
        ← Back to recipes
      </button>

      <article className="detail-hero">
        <div className="detail-image-wrap detail-image-stage">
          <img alt={recipe.name} className="detail-image" src={recipe.image} />
        </div>

        <div className="detail-summary-card">
          <div className="detail-header">
            <span className="recipe-pill">{recipe.category}</span>
            <h1>{recipe.name}</h1>
            <p>{summaryText}</p>
          </div>

          <div className="detail-stats">
            <div>
              <strong>{recipe.area}</strong>
              <span>Cuisine</span>
            </div>
            <div>
              <strong>{recipe.ingredients.length}</strong>
              <span>Ingredients</span>
            </div>
            <div>
              <strong>{Math.max(displaySteps.length, 1)}</strong>
              <span>Steps</span>
            </div>
          </div>
        </div>
      </article>

      <div className="detail-layout">
        <section className="detail-panel ingredient-panel">
          <h2>Ingredients</h2>
          <ul className="ingredient-list ingredient-checklist">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>
                <span className="check-circle" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>

          <div className="detail-note">
            <strong>chef's note</strong>
            <p>Use your freshest ingredients for the most vibrant finish.</p>
          </div>
        </section>

        <section className="detail-panel">
          <div className="detail-actions">
            <button
              className={`favorite-button ${favoriteIdSet.has(recipe.id) ? 'is-active' : ''}`}
              onClick={() => onToggleFavorite(recipe.id)}
              type="button"
            >
              {favoriteIdSet.has(recipe.id) ? 'Saved' : 'Save Recipe'}
            </button>

            {recipe.youtube ? (
              <a className="ghost-button" href={recipe.youtube} rel="noreferrer" target="_blank">
                Watch video
              </a>
            ) : null}
          </div>

          <h2>Preparation Steps</h2>
          <ol className="instruction-list detail-step-list">
            {displaySteps.map((step, index) => (
              <li key={step}>
                <span className="step-badge">{String(index + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="detail-footer-bar">
        <div>
          <strong>Ready to start?</strong>
          <span>Select the first step, gather your ingredients, and begin.</span>
        </div>
        <button className="primary-button" type="button">
          Start Cooking
        </button>
      </section>

    </section>
  )
}

export default RecipeDetail