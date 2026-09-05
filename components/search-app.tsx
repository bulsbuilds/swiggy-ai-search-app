"use client"

import { useMemo, useState } from "react"
import { Sparkles, SlidersHorizontal, X } from "lucide-react"
import type { Dish, Filters } from "@/lib/types"
import { search } from "@/lib/search"
import { SearchBar } from "@/components/search-bar"
import { FilterPanel } from "@/components/filter-panel"
import { FoodCard } from "@/components/food-card"
import { EmptyState } from "@/components/empty-state"
import { ThemeToggle } from "@/components/theme-toggle"

interface SearchAppProps {
  dishes: Dish[]
  cuisines: string[]
  priceRange: { min: number; max: number }
}

export function SearchApp({ dishes, cuisines, priceRange }: SearchAppProps) {
  const [query, setQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    maxPrice: priceRange.max,
    cuisines: [],
    minRating: 0,
    diet: "all",
  })

  const results = useMemo(() => search(dishes, query, filters), [dishes, query, filters])

  const activeFilterCount =
    (filters.diet !== "all" ? 1 : 0) +
    (filters.cuisines.length > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxPrice < priceRange.max ? 1 : 0)

  const hasQuery = query.trim().length > 0

  function resetAll() {
    setQuery("")
    setFilters({ maxPrice: priceRange.max, cuisines: [], minRating: 0, diet: "all" })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-extrabold tracking-tight">
                Swiggy <span className="text-primary">AI</span> Search
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">Order in plain English</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Natural-language food discovery
            </span>
            <h1 className="mt-4 text-pretty text-3xl font-extrabold tracking-tight sm:text-4xl">
              What are you <span className="text-primary">craving</span> today?
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-pretty text-sm text-muted-foreground sm:text-base">
              Describe it the way you&apos;d tell a friend — like{" "}
              <span className="font-medium text-foreground">&ldquo;something spicy under ₹300&rdquo;</span> — and
              we&apos;ll find the perfect dish.
            </p>
          </div>
          <div className="mx-auto mt-7 max-w-2xl">
            <SearchBar query={query} onQueryChange={setQuery} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                cuisines={cuisines}
                priceRange={priceRange}
              />
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  {results.length} {results.length === 1 ? "dish" : "dishes"}
                  {hasQuery ? " found" : " available"}
                </h2>
                {hasQuery && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Ranked for <span className="font-medium text-foreground">&ldquo;{query.trim()}&rdquo;</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {(hasQuery || activeFilterCount > 0) && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {results.length === 0 ? (
              <EmptyState query={query} onReset={resetAll} />
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((result, index) => (
                  <FoodCard key={result.dish.id} result={result} index={index} showReasons={hasQuery} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-4 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              cuisines={cuisines}
              priceRange={priceRange}
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
            >
              Show {results.length} {results.length === 1 ? "result" : "results"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
