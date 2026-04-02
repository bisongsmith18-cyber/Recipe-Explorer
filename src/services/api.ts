const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

type ApiMeal = {
  idMeal: string
  strMeal: string
  strCategory?: string
  strArea?: string
  strInstructions?: string
  strMealThumb: string
  strYoutube?: string
  [key: `strIngredient${number}`]: string | undefined
  [key: `strMeasure${number}`]: string | undefined
}

type ApiMealsResponse = {
  meals: ApiMeal[] | null
}

type ApiCategoriesResponse = {
  categories: Array<{
    strCategory: string
  }>
}

export type RecipeSummary = {
  id: string
  name: string
  category: string
  image: string
}

export type RecipeDetail = RecipeSummary & {
  area: string
  instructions: string
  ingredients: string[]
  youtube: string
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

function normalizeRecipeSummary(meal: ApiMeal, fallbackCategory = 'Featured'): RecipeSummary {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory ?? fallbackCategory,
    image: meal.strMealThumb,
  }
}

function normalizeRecipeDetail(meal: ApiMeal): RecipeDetail {
  const ingredients = Array.from({ length: 20 }, (_, index) => index + 1)
    .map((ingredientIndex) => {
      const ingredient = meal[`strIngredient${ingredientIndex}`]?.trim()
      const measure = meal[`strMeasure${ingredientIndex}`]?.trim()

      if (!ingredient) {
        return null
      }

      return measure ? `${measure} ${ingredient}`.trim() : ingredient
    })
    .filter((ingredient): ingredient is string => Boolean(ingredient))

  return {
    ...normalizeRecipeSummary(meal),
    area: meal.strArea ?? 'Global',
    instructions: meal.strInstructions ?? '',
    ingredients,
    youtube: meal.strYoutube ?? '',
  }
}

async function searchRecipesByLetter(letter: string): Promise<RecipeSummary[]> {
  const response = await requestJson<ApiMealsResponse>(`/search.php?f=${letter}`)
  return (response.meals ?? []).map((meal) => normalizeRecipeSummary(meal))
}

export async function getRecipeCategories(): Promise<string[]> {
  const response = await requestJson<ApiCategoriesResponse>('/categories.php')
  return response.categories.map((category) => category.strCategory)
}

export async function getRecipes(searchTerm: string, category: string): Promise<RecipeSummary[]> {
  const normalizedSearch = searchTerm.trim()

  if (normalizedSearch) {
    const response = await requestJson<ApiMealsResponse>(
      `/search.php?s=${encodeURIComponent(normalizedSearch)}`,
    )

    return (response.meals ?? [])
      .map((meal) => normalizeRecipeSummary(meal))
      .filter((recipe) => category === 'All' || recipe.category === category)
  }

  if (category !== 'All') {
    const response = await requestJson<ApiMealsResponse>(
      `/filter.php?c=${encodeURIComponent(category)}`,
    )

    return (response.meals ?? []).map((meal) => normalizeRecipeSummary(meal, category))
  }

  const broadSearch = await requestJson<ApiMealsResponse>('/search.php?s=')

  if (broadSearch.meals?.length) {
    return broadSearch.meals.map((meal) => normalizeRecipeSummary(meal))
  }

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const indexedRecipes = await Promise.all(alphabet.map(searchRecipesByLetter))

  return indexedRecipes.flat().filter((recipe, index, recipes) => {
    return recipes.findIndex((candidate) => candidate.id === recipe.id) === index
  })
}

export async function getRecipeById(recipeId: string): Promise<RecipeDetail> {
  const response = await requestJson<ApiMealsResponse>(
    `/lookup.php?i=${encodeURIComponent(recipeId)}`,
  )
  const recipe = response.meals?.[0]

  if (!recipe) {
    throw new Error('Recipe not found')
  }

  return normalizeRecipeDetail(recipe)
}

export async function getRecipesByIds(recipeIds: string[]): Promise<RecipeDetail[]> {
  const settledRecipes = await Promise.allSettled(
    recipeIds.map((recipeId) => getRecipeById(recipeId)),
  )

  return settledRecipes.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  )
}