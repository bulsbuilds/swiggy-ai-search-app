import { promises as fs } from "node:fs"
import path from "node:path"
import type { Dish, Diet, Spice, Portion } from "./types"

interface CuisineMeta {
  cuisine: string
  image: string
}

// Each restaurant in the dataset maps to a cuisine/category and a
// representative photo. This is the only enrichment layered on top of the CSV.
const RESTAURANT_META: Record<string, CuisineMeta> = {
  "South Bowl": { cuisine: "South Indian", image: "/food/south-indian.png" },
  "Fresh Bites": { cuisine: "Sandwiches & Wraps", image: "/food/sandwiches.png" },
  "Green Kitchen": { cuisine: "Salads & Bowls", image: "/food/salads.png" },
  "Wrap Co": { cuisine: "Wraps & Rolls", image: "/food/wraps.png" },
  "Rice Bowl Co": { cuisine: "Rice Bowls", image: "/food/rice-bowls.png" },
  "Spice House": { cuisine: "Biryani & Grills", image: "/food/biryani.png" },
  "Ghar Ka Khana": { cuisine: "Home-style", image: "/food/home-style.png" },
  "The Breakfast Club": { cuisine: "Breakfast", image: "/food/breakfast.png" },
  "Soup Station": { cuisine: "Soups", image: "/food/soups.png" },
  "Quick Bites": { cuisine: "Snacks", image: "/food/snacks.png" },
}

const FALLBACK_META: CuisineMeta = { cuisine: "All-day", image: "/food/snacks.png" }

/** Stable string hash so derived values never change between requests. */
function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Derive a stable rating (3.6 - 4.9) that rewards better protein-per-calorie
 * and quicker prep, nudged by a stable hash so equal dishes still vary.
 */
function deriveRating(name: string, protein: number, calories: number, eta: number): number {
  const proteinScore = Math.min(protein / 30, 1) // 0..1
  const lightnessScore = 1 - Math.min(calories / 700, 1) // 0..1
  const speedScore = 1 - Math.min((eta - 14) / 12, 1) // 0..1
  const jitter = (hashString(name) % 100) / 100 // 0..1
  const base = 3.6 + (0.45 * proteinScore + 0.35 * lightnessScore + 0.25 * speedScore + 0.25 * jitter)
  return Math.round(Math.min(base, 4.9) * 10) / 10
}

function deriveRatingCount(name: string): number {
  return 120 + (hashString(name + "count") % 3400)
}

// Minimal CSV line parser that respects the single quoted "tags" field.
function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      cells.push(current)
      current = ""
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map((cell) => cell.trim())
}

let cache: Dish[] | null = null

export async function getDishes(): Promise<Dish[]> {
  if (cache) return cache

  const filePath = path.join(process.cwd(), "swiggy_ai_search_food_dataset.csv")
  const raw = await fs.readFile(filePath, "utf8")
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0)
  const rows = lines.slice(1) // skip header

  const dishes: Dish[] = rows.map((line, index) => {
    const [restaurant, name, priceInr, etaMin, diet, calories, protein, spice, portion, tags] =
      parseCsvLine(line)
    const meta = RESTAURANT_META[restaurant] ?? FALLBACK_META
    const proteinValue = Number(protein)
    const caloriesValue = Number(calories)
    const etaValue = Number(etaMin)

    return {
      id: `${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      restaurant,
      name,
      price: Number(priceInr),
      eta: etaValue,
      diet: diet as Diet,
      calories: caloriesValue,
      protein: proteinValue,
      spice: spice as Spice,
      portion: portion as Portion,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      cuisine: meta.cuisine,
      image: meta.image,
      rating: deriveRating(name, proteinValue, caloriesValue, etaValue),
      ratingCount: deriveRatingCount(name),
    }
  })

  cache = dishes
  return dishes
}

export async function getCuisines(): Promise<string[]> {
  const dishes = await getDishes()
  return Array.from(new Set(dishes.map((dish) => dish.cuisine))).sort()
}

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const dishes = await getDishes()
  const prices = dishes.map((dish) => dish.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}
