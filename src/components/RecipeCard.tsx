import type { RecipeSummary } from '../services/api'

type RecipeCardProps = {
  isFavorite: boolean
  onOpen: () => void
  onToggleFavorite: () => void
  recipe: RecipeSummary
}

function RecipeCard({ isFavorite, onOpen, onToggleFavorite, recipe }: RecipeCardProps) {
  return (
    <article className="recipe-card">
      <button
        aria-label={isFavorite ? `Remove ${recipe.name} from favorites` : `Save ${recipe.name}`}
        className={`recipe-favorite-dot ${isFavorite ? 'is-active' : ''}`}
        onClick={onToggleFavorite}
        type="button"
      >
        <span className="favorite-heart" aria-hidden="true">
          ❤
        </span>
      </button>

      <button className="recipe-card-media" onClick={onOpen} type="button">
        <img alt={recipe.name} loading="lazy" src={recipe.image} />
      </button>

      <div className="recipe-card-body">
        <div className="recipe-card-copy">
          <span className="recipe-pill">{recipe.category}</span>
          <h3>{recipe.name}</h3>
          <p>Discover ingredients, steps, and serving inspiration.</p>
        </div>

        <div className="recipe-card-actions">
          <span className="recipe-meta">view recipe</span>
          <button className="recipe-link" onClick={onOpen} type="button">
            Explore →
          </button>
        </div>
      </div>
    </article>
  )
}

export default RecipeCard
