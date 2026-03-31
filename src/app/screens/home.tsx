import { useState, useEffect } from "react"
import { Link } from "react-router"
import { Card, CardContent } from "../../components/ui/card"
import {
  Camera,
  MessageCircle,
  Apple,
  Calendar,
  AlertCircle,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react"
import { Progress } from "../../components/ui/progress"
import { getOrCreateSession, getLatestRisk, getProfile, RotterdamRiskResponse } from "../../lib/api"

export function HomeScreen() {
  const [riskData, setRiskData] = useState<RotterdamRiskResponse | null>(null)
  const [userName, setUserName] = useState<string>("Queen")

  useEffect(() => {
    getOrCreateSession()
      .then((sid) => {
        getLatestRisk(sid)
          .then((res) => {
            if ("overall_risk_level" in res) {
              setRiskData(res as RotterdamRiskResponse)
            }
          })
          .catch(console.error)

        getProfile(sid)
          .then((profile) => {
            if (profile.full_name) {
              // Extract first name or use the whole name
              const firstName = profile.full_name.split(" ")[0]
              setUserName(firstName)
            }
          })
          .catch(console.error)
      })
      .catch(console.error)
  }, [])

  const riskScore = riskData ? Math.round(riskData.risk_percentage) : null
  const riskLabel = riskData?.overall_risk_level ?? null

  const riskBadgeColor =
    riskLabel === "low"
      ? "text-green-600"
      : riskLabel === "high"
      ? "text-red-600"
      : "text-yellow-600"

  return (
    <div className="min-h-screen pb-4">
      <div className="bg-primary text-white px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-white/80">Good morning,</p>
            <h1 className="text-2xl font-bold">{userName} 👑</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
        </div>
        <h2 className="text-base font-medium mb-2">Your Health at a Glance</h2>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {/* ── PCOS Risk Score ──────────────────────────────────────────── */}
        <Card className="shadow-md border-none bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">PCOS Risk Score</h3>
              </div>
              <Link to="/app/risk-report">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
            {riskScore !== null ? (
              <>
                <div className="flex items-end gap-3 mb-2">
                  <span className={`text-4xl font-bold ${riskBadgeColor}`}>{riskScore}%</span>
                  <span className="text-sm text-muted-foreground mb-2 capitalize">{riskLabel} risk</span>
                </div>
                <Progress value={riskScore} className="mb-3" />
              </>
            ) : (
              <div className="py-2">
                <p className="text-sm text-muted-foreground mb-2">No risk score computed yet.</p>
                <Link to="/app/scan" className="text-sm text-primary font-medium hover:underline">
                  Complete a scan to get your score →
                </Link>
              </div>
            )}
            <Link
              to="/app/risk-report"
              className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              View full report
              <ChevronRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <div>
          <h3 className="font-semibold mb-3 px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/app/scan",      icon: Camera,        bg: "bg-primary/10", label: "Ohemaa Scan",  sub: "Check your skin" },
              { to: "/app/chat",      icon: MessageCircle, bg: "bg-accent/10",  label: "Ask Lydia",    sub: "AI health chat" },
              { to: "/app/nutrition", icon: Apple,         bg: "bg-primary/10", label: "Meal Plan",    sub: "Local foods" },
              { to: "/app/community", icon: Users,         bg: "bg-accent/10",  label: "Cysterhood",   sub: "Community" },
            ].map(({ to, icon: Icon, bg, label, sub }) => (
              <Link key={to} to={to}>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-none">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${bg} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium">{label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Track shortcut ───────────────────────────────────────────── */}
        <Link to="/app/track">
          <Card className="shadow-sm hover:shadow-md transition-shadow border-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Cycle Tracker</h4>
                    <p className="text-xs text-muted-foreground">Log your period & symptoms</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* ── Insights ─────────────────────────────────────────────────── */}
        <Card className="shadow-md border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Today's Insights</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                <p className="text-sm text-foreground">Track your symptoms daily for a more accurate risk report</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                <p className="text-sm text-foreground">Try kontomire stew for lunch — low glycemic index</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                <p className="text-sm text-foreground">Log your period start date in Cycle Tracker to improve predictions</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}