type SearchBarProps = {
  categories: string[]
  isCategoryDisabled?: boolean
  onCategoryChange: (category: string) => void
  onSearchChange: (value: string) => void
  onSearchSubmit?: () => void
  searchValue: string
  selectedCategory: string
}

function SearchBar({
  categories,
  isCategoryDisabled = false,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  searchValue,
  selectedCategory,
}: SearchBarProps) {
  return (
    <section className="search-module">
      <form
        className="search-panel"
        onSubmit={(event) => {
          event.preventDefault()
          onSearchSubmit?.()
        }}
      >
        <label className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Find your next masterpiece"
            type="search"
            value={searchValue}
          />
        </label>

        <button className="search-submit" type="submit">
          Search
        </button>
      </form>

      <div className="category-row">
        <div className="category-row-head">
          <span>Categories</span>
          <small>View All</small>
        </div>

        <div className="category-pills">
          <button
            className={selectedCategory === 'All' ? 'is-active' : undefined}
            onClick={() => onCategoryChange('All')}
            type="button"
          >
            All
          </button>

          {categories.slice(0, 7).map((category) => (
            <button
              className={selectedCategory === category ? 'is-active' : undefined}
              disabled={isCategoryDisabled}
              key={category}
              onClick={() => onCategoryChange(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <label className="field-group category-select-wrap">
        <span>Category picker</span>
        <select
          disabled={isCategoryDisabled}
          onChange={(event) => onCategoryChange(event.target.value)}
          value={selectedCategory}
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}

export default SearchBar