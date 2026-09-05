export type Diet = "Veg" | "Non-Veg"
export type Spice = "Mild" | "Medium" | "Spicy"
export type Portion = "Small" | "Medium" | "Large"

export interface Dish {
  id: string
  restaurant: string
  name: string
  price: number
  eta: number
  diet: Diet
  calories: number
  protein: number
  spice: Spice
  portion: Portion
  tags: string[]
  /** Derived cuisine/category from the restaurant + dish */
  cuisine: string
  /** Deterministic rating derived from the dish attributes */
  rating: number
  ratingCount: number
  image: string
}

export interface SearchResult {
  dish: Dish
  score: number
  reasons: string[]
}

export interface Filters {
  maxPrice: number
  cuisines: string[]
  minRating: number
  diet: Diet | "all"
}
