import { SearchX } from "lucide-react"
import { EXAMPLE_QUERIES } from "@/lib/search"

interface EmptyStateProps {
  query: string
  onReset: () => void
}

export function EmptyState({ query, onReset }: EmptyStateProps) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <SearchX className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-bold">No dishes match that yet</h3>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        {query.trim()
          ? `We couldn't find anything for “${query.trim()}”. Try loosening a filter or rephrasing your craving.`
          : "Try adjusting your filters to see more dishes."}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Reset search
      </button>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {EXAMPLE_QUERIES.slice(0, 3).map((example) => (
          <span key={example} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {example}
          </span>
        ))}
      </div>
    </div>
  )
}
