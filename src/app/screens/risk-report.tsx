import { useState, useEffect } from "react"
import { Link } from "react-router"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import {
  AlertCircle,
  RefreshCw,
  MapPin,
  Download,
  Share2,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import {
  getOrCreateSession,
  getLatestRisk,
  computeRisk,
  RotterdamRiskResponse,
} from "../../lib/api"

function riskColors(level: string) {
  switch (level) {
    case "low":    return { badge: "bg-green-100 text-green-700",  text: "text-green-600",  bg: "from-green-50 to-emerald-50" }
    case "high":   return { badge: "bg-red-100 text-red-700",      text: "text-red-600",    bg: "from-red-50 to-orange-50" }
    default:       return { badge: "bg-yellow-100 text-yellow-700",text: "text-yellow-600", bg: "from-yellow-50 to-orange-50" }
  }
}

const CRITERIA_LABELS: Record<string, string> = {
  oligo_anovulation: "Irregular / absent ovulation",
  hyperandrogenism: "Clinical/biochemical hyperandrogenism",
  polycystic_ovaries: "Polycystic ovaries (morphology)",
}

export function RiskReportScreen() {
  const [report, setReport] = useState<RotterdamRiskResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRisk = async (forceCompute = false) => {
    setError(null)
    try {
      const sid = await getOrCreateSession()
      if (!forceCompute) {
        const latest = await getLatestRisk(sid)
        if ("overall_risk_level" in latest) {
          setReport(latest as RotterdamRiskResponse)
          return
        }
      }
      // No stored result — compute fresh
      setComputing(true)
      const fresh = await computeRisk(sid)
      setReport(fresh)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load risk report")
    } finally {
      setLoading(false)
      setComputing(false)
    }
  }

  useEffect(() => { fetchRisk() }, [])

  const handleRecompute = async () => {
    setLoading(true)
    await fetchRisk(true)
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading || computing) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-primary text-white px-6 pt-12 pb-8 rounded-b-[2rem]">
          <Link to="/app" className="inline-block mb-4 text-sm text-white/80">← Back to Home</Link>
          <h1 className="text-2xl font-bold mb-2">PCOS Risk Report</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-center">
            {computing ? "Computing your Rotterdam Criteria score…" : "Loading your risk report…"}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            This uses your scan results, period logs, and symptom history.
          </p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-primary text-white px-6 pt-12 pb-8 rounded-b-[2rem]">
          <Link to="/app" className="inline-block mb-4 text-sm text-white/80">← Back to Home</Link>
          <h1 className="text-2xl font-bold mb-2">PCOS Risk Report</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500" />
          <p className="font-semibold">Not enough data yet</p>
          <p className="text-sm text-muted-foreground">
            {error ?? "Please log at least one period and complete a scan before computing your risk score."}
          </p>
          <Button onClick={handleRecompute} className="rounded-xl bg-primary hover:bg-primary/90 mt-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Try computing now
          </Button>
          <Link to="/app/track" className="text-sm text-primary font-medium hover:underline">
            → Go to Cycle Tracker
          </Link>
        </div>
      </div>
    )
  }

  const colors = riskColors(report.overall_risk_level)

  return (
    <div className="min-h-screen pb-4">
      <div className="bg-primary text-white px-6 pt-12 pb-8 rounded-b-[2rem]">
        <Link to="/app" className="inline-block mb-4 text-sm text-white/80">← Back to Home</Link>
        <h1 className="text-2xl font-bold mb-2">PCOS Risk Report</h1>
        <p className="text-sm text-white/80">Based on Rotterdam Criteria</p>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* ── Overall score ────────────────────────────────────────────── */}
        <Card className={`shadow-lg border-none bg-gradient-to-br ${colors.bg}`}>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white shadow-md flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${colors.text}`}>{Math.round(report.risk_percentage)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Risk</p>
                </div>
              </div>
              <Badge className={`${colors.badge} mb-2`}>
                {report.overall_risk_level.toUpperCase()} RISK
              </Badge>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {report.overall_risk_level === "low"
                  ? "Low PCOS likelihood"
                  : report.overall_risk_level === "moderate"
                  ? "You may have PCOS"
                  : "High PCOS likelihood"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on Rotterdam Criteria ({report.criteria_count}/3 met)
              </p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`w-4 h-4 ${colors.text}`} />
                <h4 className="text-sm font-semibold">What this means</h4>
              </div>
              <p className="text-sm text-muted-foreground">{report.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Rotterdam criteria ───────────────────────────────────────── */}
        <Card className="shadow-sm border-none">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Rotterdam Criteria</h3>
            <div className="space-y-3">
              {(["oligo_anovulation", "hyperandrogenism", "polycystic_ovaries"] as const).map((criterion) => {
                const met = report.rotterdam_criteria_met.includes(criterion)
                return (
                  <div key={criterion} className="flex items-center gap-3">
                    {met
                      ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      : <div className="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0" />}
                    <span className={`text-sm ${met ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {CRITERIA_LABELS[criterion] ?? criterion}
                    </span>
                    {met && <Badge className="ml-auto bg-green-100 text-green-700 text-xs">Met</Badge>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Progress bars ────────────────────────────────────────────── */}
        {report.detailed_breakdown && Object.keys(report.detailed_breakdown).length > 0 && (
          <Card className="shadow-sm border-none">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Factor Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(report.detailed_breakdown).map(([key, val]) => {
                  const pct = typeof val === "number" ? Math.round((val as number) * 100) : null
                  if (pct === null) return null
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Next steps ───────────────────────────────────────────────── */}
        <Card className="shadow-md border-none bg-primary/5">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Recommended Next Steps</h3>
            <ol className="space-y-3">
              {[
                { step: "Consult a Healthcare Provider", detail: "Share this report with a doctor for proper diagnosis" },
                { step: "Continue Tracking Symptoms", detail: "Log daily to build a complete picture for your doctor" },
                { step: "Follow Nutrition Recommendations", detail: "Low-GI foods can help manage symptoms" },
                { step: "Join Community Support", detail: "Connect with others in Cysterhood" },
              ].map(({ step, detail }, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-semibold text-primary flex-shrink-0">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-medium">{step}</p>
                    <p className="text-xs text-muted-foreground mt-1">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none bg-accent text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Find a Nearby Clinic</h3>
                <p className="text-xs text-white/90">Get professional medical consultation</p>
              </div>
            </div>
            <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl">
              Search Clinics in Accra
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 rounded-xl border-2">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          <Button variant="outline" className="h-12 rounded-xl border-2">
            <Share2 className="w-4 h-4 mr-2" /> Share Report
          </Button>
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" onClick={handleRecompute} className="text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 mr-2" /> Recompute with latest data
          </Button>
        </div>

        <Card className="shadow-sm border-none bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Medical Disclaimer:</strong> This report is for informational purposes only and is not a medical diagnosis. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}