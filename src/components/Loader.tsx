type LoaderProps = {
  label?: string
}

function Loader({ label = 'Loading recipes...' }: LoaderProps) {
  return (
    <div aria-live="polite" className="loader" role="status">
      <div className="loader-shell">
        <div className="loader-image" />
        <div className="loader-copy">
          <div className="loader-chip" />
          <div className="loader-line loader-line-title" />
          <div className="loader-line" />
          <div className="loader-line loader-line-short" />
        </div>
      </div>
      <p>{label}</p>
    </div>
  )
}

export default Loader
