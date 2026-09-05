import Image from "next/image"
import { Star, Clock, Flame, Dumbbell, Sparkles } from "lucide-react"
import type { SearchResult } from "@/lib/types"

interface FoodCardProps {
  result: SearchResult
  index: number
  showReasons: boolean
}

const SPICE_LABEL: Record<string, string> = {
  Mild: "Mild",
  Medium: "Medium",
  Spicy: "Spicy",
}

export function FoodCard({ result, index, showReasons }: FoodCardProps) {
  const { dish, reasons } = result
  const isVeg = dish.diet === "Veg"

  return (
    <article
      className="animate-rise group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={dish.image || "/placeholder.svg"}
          alt={dish.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-1 text-[11px] font-bold text-foreground backdrop-blur-sm">
          {dish.cuisine}
        </span>
        <VegIndicator isVeg={isVeg} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold leading-tight">{dish.name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{dish.restaurant}</p>
          </div>
          <span
            className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: "var(--rating)" }}
          >
            <Star className="h-3 w-3 fill-current" />
            {dish.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {dish.eta} min
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            {dish.calories} cal
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="h-3.5 w-3.5" />
            {dish.protein}g protein
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              dish.spice === "Spicy"
                ? "bg-nonveg/10 text-nonveg"
                : dish.spice === "Medium"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {SPICE_LABEL[dish.spice]}
          </span>
        </div>

        {showReasons && reasons.length > 0 && (
          <div className="mt-3 rounded-xl bg-secondary/60 p-2.5">
            <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-secondary-foreground">
              <Sparkles className="h-3 w-3" />
              Why it matches
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {reasons.slice(0, 4).map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-lg font-extrabold">₹{dish.price}</span>
          <button
            type="button"
            className="rounded-lg border border-primary px-4 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  )
}

function VegIndicator({ isVeg }: { isVeg: boolean }) {
  const color = isVeg ? "var(--veg)" : "var(--nonveg)"
  return (
    <span
      className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded border bg-background/95"
      style={{ borderColor: color }}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}
