import { getDishes, getCuisines, getPriceRange } from "@/lib/food-data"
import { SearchApp } from "@/components/search-app"

export default async function Page() {
  const [dishes, cuisines, priceRange] = await Promise.all([
    getDishes(),
    getCuisines(),
    getPriceRange(),
  ])

  return <SearchApp dishes={dishes} cuisines={cuisines} priceRange={priceRange} />
}
