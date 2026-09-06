import type { Dish, Filters, SearchResult } from "./types"

interface ParsedQuery {
  maxPrice: number | null
  minPrice: number | null
  maxEta: number | null
  diet: "Veg" | "Non-Veg" | null
  spice: "Spicy" | "Mild" | null
  wantsHealthy: boolean
  wantsProtein: boolean
  wantsQuick: boolean
  wantsFilling: boolean
  wantsLight: boolean
  meal: "breakfast" | "dinner" | "lunch" | null
  dishType: string | null
  keywords: string[]
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "for",
  "me",
  "some",
  "something",
  "want",
  "i",
  "need",
  "with",
  "and",
  "or",
  "of",
  "to",
  "under",
  "below",
  "less",
  "than",
  "within",
  "around",
  "about",
  "that",
  "is",
  "are",
  "food",
  "dish",
  "please",
  "give",
  "show",
  "find",
  "looking",
  "get",
  "would",
  "like",
  "in",
  "at",
  "my",
  "budget",
  "rs",
  "rupees",
  "inr",
  "price",
  "cheap",
  "affordable",
  "options",
  "option",
  "good",
  "nice",
])

const DIET_VEG = ["veg", "vegetarian", "vegan", "paneer", "plant"]

const DIET_NONVEG = [
  "non-veg",
  "nonveg",
  "non veg",
  "chicken",
  "egg",
  "meat",
  "mutton",
  "fish",
]

function detectDishType(query: string): string | null {
  const dishTypes = [
    "soup",
    "biryani",
    "momos",
    "wrap",
    "sandwich",
    "salad",
    "bowl",
    "dosa",
    "idli",
    "vada",
    "rice",
    "tikka",
    "toast",
    "poha",
    "upma",
    "khichdi",
  ]

  return dishTypes.find((type) => query.includes(type)) ?? null
}

function extractPrice(query: string, pattern: RegExp): number | null {
  const match = query.match(pattern)
  return match ? Number(match[1]) : null
}

export function parseQuery(rawQuery: string): ParsedQuery {
  const query = rawQuery.toLowerCase()

  const dishType = detectDishType(query)

  const maxPrice =
    extractPrice(
      query,
      /(?:under|below|less than|within|upto|up to|max|cheaper than)\s*₹?\s*(\d{2,4})/
    ) ??
    extractPrice(query, /₹\s*(\d{2,4})\s*(?:or less|max)/) ??
    (/(?:cheap|budget|affordable|pocket)/.test(query) ? 200 : null)

  const minPrice = extractPrice(
    query,
    /(?:over|above|more than|at least)\s*₹?\s*(\d{2,4})/
  )

  const maxEta =
    extractPrice(
      query,
      /(?:under|below|within|in)\s*(\d{1,3})\s*(?:min|mins|minutes)/
    ) ??
    (/(?:quick|fast|asap|hurry|instant)/.test(query) ? 17 : null)

  let diet: ParsedQuery["diet"] = null

  if (DIET_NONVEG.some((word) => query.includes(word))) {
    diet = "Non-Veg"
  } else if (DIET_VEG.some((word) => query.includes(word))) {
    diet = "Veg"
  }

  let spice: ParsedQuery["spice"] = null

  if (/(?:spicy|hot|fiery|chilli|chili|masaledar)/.test(query)) {
    spice = "Spicy"
  } else if (/(?:mild|not spicy|no spice|less spicy)/.test(query)) {
    spice = "Mild"
  }

  const wantsHealthy =
    /(?:healthy|health|low cal|low-cal|low calorie|clean|nutritious|guilt)/.test(
      query
    )

  const wantsLight = /(?:light|lite|salad|soup)/.test(query)

  const wantsProtein =
    /(?:protein|high protein|gym|muscle|workout|post workout|fitness)/.test(
      query
    )

  const wantsQuick =
    maxEta !== null || /(?:quick|fast|snack|grab)/.test(query)

  const wantsFilling =
    /(?:filling|hearty|heavy|full meal|satisfying|big)/.test(query)

  let meal: ParsedQuery["meal"] = null

  if (/breakfast|morning/.test(query)) {
    meal = "breakfast"
  } else if (/dinner|supper|evening/.test(query)) {
    meal = "dinner"
  } else if (/lunch|midday/.test(query)) {
    meal = "lunch"
  }

  const keywords = query
    .replace(/[₹]/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 2 &&
        !STOP_WORDS.has(word) &&
        !/^\d+$/.test(word)
    )

  return {
    maxPrice,
    minPrice,
    maxEta,
    diet,
    spice,
    wantsHealthy,
    wantsProtein,
    wantsQuick,
    wantsFilling,
    wantsLight,
    meal,
    dishType,
    keywords,
  }
}

/**
 * Core dish type is treated as a hard constraint.
 *
 * Example:
 * "spicy chicken soup"
 *
 * Only dishes that are actually soups should survive this gate.
 */
function matchesDishType(dish: Dish, dishType: string): boolean {
  const name = dish.name.toLowerCase()
  const cuisine = dish.cuisine.toLowerCase()

  if (dishType === "soup") {
    return name.includes("soup") || cuisine === "soups"
  }

  return name.includes(dishType)
}

function scoreDish(
  dish: Dish,
  parsed: ParsedQuery
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Price requirement
  if (parsed.maxPrice !== null) {
    if (dish.price <= parsed.maxPrice) {
      score += 3
      reasons.push(`Under ₹${parsed.maxPrice} — costs ₹${dish.price}`)
    } else {
      score -= 4
    }
  }

  if (parsed.minPrice !== null && dish.price >= parsed.minPrice) {
    score += 1
  }

  // Diet requirement
  if (parsed.diet) {
    if (dish.diet === parsed.diet) {
      score += 3

      reasons.push(
        parsed.diet === "Veg"
          ? "Vegetarian"
          : "Non-vegetarian"
      )
    } else {
      score -= 5
    }
  }

  // Spice requirement
  if (parsed.spice) {
    if (dish.spice === parsed.spice) {
      score += 3

      reasons.push(
        parsed.spice === "Spicy"
          ? "Spicy heat"
          : "Mild & easy"
      )
    } else if (
      parsed.spice === "Spicy" &&
      dish.spice === "Medium"
    ) {
      score += 1
      reasons.push("Medium spice")
    } else if (parsed.spice === "Spicy") {
      score -= 2
    }
  }

  // Healthy
  if (parsed.wantsHealthy) {
    if (dish.calories <= 350) {
      score += 2
      reasons.push(`Light — ${dish.calories} cal`)
    }

    if (dish.tags.includes("light")) {
      score += 1
    }
  }

  // Light
  if (
    parsed.wantsLight &&
    (dish.tags.includes("light") || dish.calories <= 320)
  ) {
    score += 2

    if (!reasons.some((r) => r.startsWith("Light"))) {
      reasons.push(`Light — ${dish.calories} cal`)
    }
  }

  // Protein
  if (parsed.wantsProtein) {
    if (dish.protein >= 20) {
      score += 3
      reasons.push(`High protein — ${dish.protein}g`)
    } else if (dish.protein >= 14) {
      score += 1
    }
  }

  // Quick
  if (
    parsed.wantsQuick &&
    dish.eta <= (parsed.maxEta ?? 17)
  ) {
    score += 2
    reasons.push(`Ready in ~${dish.eta} min`)
  }

  // Filling
  if (
    parsed.wantsFilling &&
    (dish.tags.includes("filling") ||
      dish.portion === "Large")
  ) {
    score += 2
    reasons.push("Filling portion")
  }

  // Meal context
  if (
    parsed.meal === "breakfast" &&
    (
      dish.restaurant === "The Breakfast Club" ||
      dish.tags.includes("quick")
    )
  ) {
    score += 2

    if (dish.restaurant === "The Breakfast Club") {
      reasons.push("Breakfast favourite")
    }
  }

  if (
    parsed.meal === "dinner" &&
    (
      dish.tags.includes("filling") ||
      dish.portion === "Large"
    )
  ) {
    score += 2

    if (!reasons.includes("Filling portion")) {
      reasons.push("Hearty for dinner")
    }
  }

  if (
    parsed.meal === "lunch" &&
    dish.tags.includes("filling")
  ) {
    score += 1
  }

  // Keyword matching
  //
  // The core dish type has already been handled as a hard gate,
  // so don't score it again here.
  const semanticKeywords = parsed.keywords.filter(
    (keyword) => keyword !== parsed.dishType
  )

  const haystack =
    `${dish.name} ${dish.restaurant} ${dish.cuisine} ${dish.tags.join(" ")}`
      .toLowerCase()

  for (const keyword of semanticKeywords) {
    const inName = dish.name
      .toLowerCase()
      .includes(keyword)

    const inHaystack = haystack.includes(keyword)

    if (inName) {
      score += 5
      reasons.push(`Matches "${keyword}"`)
    } else if (inHaystack) {
      score += 1
      reasons.push(`Related to "${keyword}"`)
    } else {
      score -= 3
    }
  }

  return { score, reasons }
}

function passesFilters(
  dish: Dish,
  filters: Filters
): boolean {
  if (dish.price > filters.maxPrice) return false

  if (dish.rating < filters.minRating) return false

  if (
    filters.diet !== "all" &&
    dish.diet !== filters.diet
  ) {
    return false
  }

  if (
    filters.cuisines.length > 0 &&
    !filters.cuisines.includes(dish.cuisine)
  ) {
    return false
  }

  return true
}

export function search(
  dishes: Dish[],
  query: string,
  filters: Filters
): SearchResult[] {
  const trimmed = query.trim()

  const parsed = trimmed
    ? parseQuery(trimmed)
    : null

  const hasQuery = Boolean(
    parsed &&
      (
        parsed.keywords.length > 0 ||
        parsed.maxPrice !== null ||
        parsed.minPrice !== null ||
        parsed.diet !== null ||
        parsed.spice !== null ||
        parsed.wantsHealthy ||
        parsed.wantsProtein ||
        parsed.wantsQuick ||
        parsed.wantsFilling ||
        parsed.wantsLight ||
        parsed.meal !== null ||
        parsed.dishType !== null
      )
  )

  // Apply normal UI filters first,
  // then apply the natural-language dish-type gate.
  const filtered = dishes.filter((dish) => {
    if (!passesFilters(dish, filters)) {
      return false
    }

    if (
      parsed?.dishType &&
      !matchesDishType(dish, parsed.dishType)
    ) {
      return false
    }

    return true
  })

  // No meaningful natural-language query:
  // show highest-rated dishes first.
  if (!parsed || !hasQuery) {
    return filtered
      .map((dish) => ({
        dish,
        score: 0,
        reasons: [] as string[],
      }))
      .sort(
        (a, b) =>
          b.dish.rating - a.dish.rating ||
          a.dish.price - b.dish.price
      )
  }

  // Score remaining candidates based on the user's
  // other requirements and preferences.
  return filtered
    .map((dish) => {
      const { score, reasons } = scoreDish(
        dish,
        parsed
      )

      return {
        dish,
        score,
        reasons,
      }
    })
    .filter((result) => result.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.dish.rating - a.dish.rating ||
        a.dish.price - b.dish.price
    )
}
