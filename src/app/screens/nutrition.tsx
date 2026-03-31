import { useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Apple,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  ChevronRight,
  Utensils,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { recommendNutrition, NutritionResponse } from "../../lib/api"

const staticMeals = [
  { id: 1, name: "Boiled Unripe Plantain", description: "With kontomire stew and fish", time: "Breakfast", glycemicScore: "low", calories: 320, image: "🍌" },
  { id: 2, name: "Red-Red (Bean Stew)", description: "With ripe plantain", time: "Lunch", glycemicScore: "medium", calories: 450, image: "🫘" },
  { id: 3, name: "Grilled Tilapia", description: "With garden egg salad", time: "Dinner", glycemicScore: "low", calories: 280, image: "🐟" },
]

const swapSuggestions = [
  { from: "White rice", to: "Unripe plantain", reason: "Lower glycemic index", impact: "Better blood sugar control" },
  { from: "White bread", to: "Oat porridge", reason: "More fiber", impact: "Longer satiety" },
  { from: "Fried plantain", to: "Boiled plantain", reason: "Less oil", impact: "Reduced inflammation" },
]

function glycemicColor(score: string) {
  if (score === "low") return "bg-green-100 text-green-700"
  if (score === "medium") return "bg-yellow-100 text-yellow-700"
  return "bg-red-100 text-red-700"
}

function glycemicIcon(score: string) {
  if (score === "low") return <TrendingDown className="w-3 h-3" />
  if (score === "medium") return <ArrowRightLeft className="w-3 h-3" />
  return <TrendingUp className="w-3 h-3" />
}

function giLabel(gi: number | null) {
  if (gi === null) return null
  if (gi <= 55) return { label: "Low GI", color: "bg-green-100 text-green-700" }
  if (gi <= 70) return { label: "Medium GI", color: "bg-yellow-100 text-yellow-700" }
  return { label: "High GI", color: "bg-red-100 text-red-700" }
}

export function NutritionScreen() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NutritionResponse | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    setSearchError(null)
    try {
      const res = await recommendNutrition(query.trim())
      setResult(res)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const giInfo = result ? giLabel(result.gi_index) : null

  return (
    <div className="min-h-screen pb-4">
      <div className="bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <h1 className="text-2xl font-bold mb-2">Nutrition Logic</h1>
        <p className="text-sm text-white/80">PCOS-friendly local meal plans</p>
      </div>

      <div className="px-6 py-6 space-y-4">

        {/* ── Food Search ───────────────────────────────────────────────── */}
        <Card className="shadow-md border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Check Any Food</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Ask if a specific food is PCOS-friendly — try "fufu", "jollof rice", "garden eggs"
            </p>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. fufu, kenkey, kontomire..."
                className="flex-1 h-12 rounded-xl bg-background"
              />
              <Button onClick={handleSearch} disabled={loading || !query.trim()} className="h-12 px-4 rounded-xl bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>

            {/* Search result */}
            {searchError && (
              <p className="text-sm text-red-500 mt-3">{searchError}</p>
            )}

            {result && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-semibold capitalize">{result.matched_food ?? query}</h4>
                  <div className="flex gap-2 flex-wrap">
                    {result.pcos_friendly !== null && (
                      <Badge className={result.pcos_friendly ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {result.pcos_friendly
                          ? <><CheckCircle2 className="w-3 h-3 mr-1 inline" />PCOS-friendly</>
                          : <><XCircle className="w-3 h-3 mr-1 inline" />Not ideal</>}
                      </Badge>
                    )}
                    {giInfo && <Badge className={giInfo.color}>{giInfo.label}{result.gi_index !== null ? ` (${result.gi_index})` : ""}</Badge>}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>

                {result.alternatives.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-primary mb-2">Better alternatives:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.alternatives.map((alt) => (
                        <Badge key={alt} variant="secondary" className="bg-primary/10 text-primary cursor-pointer" onClick={() => { setQuery(alt); setResult(null) }}>
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Today's Nutrition summary ─────────────────────────────────── */}
        <Card className="shadow-md border-none bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Today's Nutrition</h3>
              <Badge className="bg-green-100 text-green-700">On Track ✓</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[["1050", "Calories"], ["45g", "Protein"], ["85g", "Low GI Carbs"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{val}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Meal Plan ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-semibold">Today's Meal Plan</h3>
            <p className="text-xs text-muted-foreground">Suggested</p>
          </div>
          <div className="space-y-3">
            {staticMeals.map((meal) => (
              <Card key={meal.id} className="shadow-sm border-none">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl flex-shrink-0">
                      {meal.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs border-primary/20">{meal.time}</Badge>
                        <Badge className={`text-xs ${glycemicColor(meal.glycemicScore)}`}>
                          {glycemicIcon(meal.glycemicScore)}
                          <span className="ml-1 capitalize">{meal.glycemicScore} GI</span>
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{meal.name}</h4>
                      <p className="text-xs text-muted-foreground">{meal.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{meal.calories} calories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Smart swaps ──────────────────────────────────────────────── */}
        <div>
          <h3 className="font-semibold mb-3 px-1">Smart Swap Suggestions</h3>
          <Card className="shadow-sm border-none">
            <CardContent className="p-5">
              <div className="space-y-4">
                {swapSuggestions.map((swap, index) => (
                  <div key={index}>
                    {index > 0 && <div className="border-t border-border my-4" />}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground line-through">{swap.from}</span>
                        <ArrowRightLeft className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm font-medium text-primary">{swap.to}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{swap.reason} • {swap.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Local food guide ─────────────────────────────────────────── */}
        <Card className="shadow-md border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Apple className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">PCOS-Friendly Local Foods</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: "Best Choices (Low GI)", cls: "bg-green-50 text-green-700 border border-green-200", foods: ["Beans","Unripe Plantain","Kontomire","Garden Eggs","Tilapia","Groundnut Soup"] },
                { title: "Eat in Moderation", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200", foods: ["Ripe Plantain","Yam","Gari","Brown Rice"] },
                { title: "Limit These", cls: "bg-red-50 text-red-700 border border-red-200", foods: ["White Rice","Sugar Drinks","White Bread","Fried Foods"] },
              ].map(({ title, cls, foods }) => (
                <div key={title}>
                  <h4 className="text-sm font-medium mb-2 text-primary">{title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {foods.map((f) => (
                      <Badge key={f} variant="secondary" className={cls}>{f}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-primary text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Weekly Meal Plan</h4>
                  <p className="text-xs text-white/80">Get 7 days of recipes</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}