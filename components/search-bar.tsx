"use client"

import { Search, X } from "lucide-react"
import { EXAMPLE_QUERIES } from "@/lib/search"

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-shadow focus-within:border-primary focus-within:shadow-md">
        <Search className="h-5 w-5 shrink-0 text-primary" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Try “healthy vegetarian dinner” or “spicy chicken under ₹300”"
          aria-label="Search for food in natural language"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-base"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Try:</span>
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onQueryChange(example)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:bg-secondary hover:text-secondary-foreground"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
