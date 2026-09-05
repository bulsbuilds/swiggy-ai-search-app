"use client"

import type { Diet, Filters } from "@/lib/types"

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
  cuisines: string[]
  priceRange: { min: number; max: number }
}

const DIET_OPTIONS: { label: string; value: Diet | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Veg", value: "Veg" },
  { label: "Non-Veg", value: "Non-Veg" },
]

const RATING_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "4.0+", value: 4 },
  { label: "4.5+", value: 4.5 },
]

export function FilterPanel({ filters, onChange, cuisines, priceRange }: FilterPanelProps) {
  function toggleCuisine(cuisine: string) {
    const next = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter((item) => item !== cuisine)
      : [...filters.cuisines, cuisine]
    onChange({ ...filters, cuisines: next })
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
      <div>
        <FilterLabel>Preference</FilterLabel>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {DIET_OPTIONS.map((option) => {
            const active = filters.diet === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...filters, diet: option.value })}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.value === "Veg" && active && <span className="text-veg">● </span>}
                {option.value === "Non-Veg" && active && <span className="text-nonveg">● </span>}
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <FilterLabel>Max price</FilterLabel>
          <span className="text-sm font-bold text-primary">₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          value={filters.maxPrice}
          onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
          aria-label="Maximum price"
          className="mt-3 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>₹{priceRange.min}</span>
          <span>₹{priceRange.max}</span>
        </div>
      </div>

      <div>
        <FilterLabel>Minimum rating</FilterLabel>
        <div className="mt-2 flex gap-2">
          {RATING_OPTIONS.map((option) => {
            const active = filters.minRating === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...filters, minRating: option.value })}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary bg-secondary text-secondary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <FilterLabel>Cuisine</FilterLabel>
        <div className="mt-2 space-y-1.5">
          {cuisines.map((cuisine) => {
            const checked = filters.cuisines.includes(cuisine)
            return (
              <label
                key={cuisine}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm transition-colors hover:text-foreground"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    checked ? "border-primary bg-primary" : "border-input bg-card"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground" fill="none">
                      <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCuisine(cuisine)}
                  className="sr-only"
                />
                <span className={checked ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {cuisine}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</span>
  )
}
