import { useState, useEffect } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  Moon,
} from "lucide-react"
import { Checkbox } from "../../components/ui/checkbox"
import {
  getOrCreateSession,
  logPeriod,
  logSymptoms,
  logSleep,
  FlowIntensity,
  SleepQuality,
} from "../../lib/api"

const SYMPTOM_FIELDS: { key: string; label: string }[] = [
  { key: "cramps", label: "Cramps" },
  { key: "bloating", label: "Bloating" },
  { key: "has_mood_swings", label: "Mood swings" },
  { key: "has_acne", label: "Acne" },
  { key: "has_fatigue", label: "Fatigue" },
  { key: "has_hair_loss", label: "Hair loss" },
  { key: "has_weight_gain", label: "Weight gain" },
  { key: "tender_breasts", label: "Tender breasts" },
  { key: "backache", label: "Backache" },
  { key: "sleep_impact", label: "Sleep disrupted" },
]

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

function toYMD(d: Date): string {
  return d.toISOString().split("T")[0]
}

export function TrackScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Period log state
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity | "">("")
  const [periodLoading, setPeriodLoading] = useState(false)
  const [periodMsg, setPeriodMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Symptom state
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({})
  const [symptomsLoading, setSymptomsLoading] = useState(false)
  const [symptomsMsg, setSymptomsMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Sleep state
  const [sleepHours, setSleepHours] = useState<number | "">("")
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | "">("")
  const [sleepLoading, setSleepLoading] = useState(false)
  const [sleepMsg, setSleepMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    getOrCreateSession().then(setSessionId).catch(console.error)
  }, [])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const handlePeriodSubmit = async () => {
    if (!sessionId || !periodStart) return
    setPeriodLoading(true)
    setPeriodMsg(null)
    try {
      await logPeriod({
        session_id: sessionId,
        period_start_date: periodStart,
        period_end_date: periodEnd || undefined,
        flow_intensity: (flowIntensity as FlowIntensity) || undefined,
      })
      setPeriodMsg({ ok: true, text: "Period logged successfully ✓" })
      setPeriodStart(""); setPeriodEnd(""); setFlowIntensity("")
    } catch (e) {
      setPeriodMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to log period" })
    } finally {
      setPeriodLoading(false)
    }
  }

  const handleSymptomsSubmit = async () => {
    if (!sessionId) return
    setSymptomsLoading(true)
    setSymptomsMsg(null)
    try {
      await logSymptoms({ session_id: sessionId, ...symptoms })
      setSymptomsMsg({ ok: true, text: "Symptoms logged successfully ✓" })
      setSymptoms({})
    } catch (e) {
      setSymptomsMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to log symptoms" })
    } finally {
      setSymptomsLoading(false)
    }
  }

  const handleSleepSubmit = async () => {
    if (!sessionId || !sleepHours || !sleepQuality) return
    setSleepLoading(true)
    setSleepMsg(null)
    try {
      await logSleep({
        session_id: sessionId,
        sleep_hours: Number(sleepHours),
        sleep_quality: sleepQuality as SleepQuality,
        sleep_impact: symptoms["sleep_impact"] ?? false,
      })
      setSleepMsg({ ok: true, text: "Sleep logged successfully ✓" })
      setSleepHours(""); setSleepQuality("")
    } catch (e) {
      setSleepMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to log sleep" })
    } finally {
      setSleepLoading(false)
    }
  }

  const toggleSymptom = (key: string) =>
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }))

  const inputCls = "mt-1 w-full h-12 rounded-xl border border-border px-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"

  return (
    <div className="min-h-screen pb-4">
      <div className="bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <h1 className="text-2xl font-bold mb-2">Cycle Tracker</h1>
        <p className="text-sm text-white/80">Track your period and symptoms</p>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* ── Calendar ──────────────────────────────────────────────────── */}
        <Card className="shadow-md border-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="h-8 w-8 p-0 rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="font-semibold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="h-8 w-8 p-0 rounded-full">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth()
                return (
                  <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-sm bg-white text-foreground ${isToday ? "ring-2 ring-primary font-bold" : ""}`}>
                    {day}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4 pt-4 border-t border-border text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary" /><span className="text-muted-foreground">Period</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-accent" /><span className="text-muted-foreground">Ovulation</span></div>
              <div className="flex items-center gap-1.5"><Circle className="w-3 h-3 text-primary" /><span className="text-muted-foreground">Logged</span></div>
            </div>
          </CardContent>
        </Card>

        {/* ── Log Period ────────────────────────────────────────────────── */}
        <Card className="shadow-md border-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Log Period</h3>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Start date</label>
                <input type="date" value={periodStart} max={toYMD(new Date())} onChange={(e) => setPeriodStart(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium">End date <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input type="date" value={periodEnd} min={periodStart} max={toYMD(new Date())} onChange={(e) => setPeriodEnd(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium">Flow intensity</label>
                <select value={flowIntensity} onChange={(e) => setFlowIntensity(e.target.value as FlowIntensity)} className={inputCls}>
                  <option value="">Select...</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                  <option value="none">None (spotting)</option>
                </select>
              </div>
              {periodMsg && <p className={`text-sm ${periodMsg.ok ? "text-green-600" : "text-red-500"}`}>{periodMsg.text}</p>}
              <Button onClick={handlePeriodSubmit} disabled={!periodStart || periodLoading || !sessionId} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                {periodLoading ? "Saving..." : "Log Period"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Log Symptoms ──────────────────────────────────────────────── */}
        <Card className="shadow-md border-none">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Log Today's Symptoms</h3>
            <div className="grid grid-cols-2 gap-3">
              {SYMPTOM_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2 p-3 rounded-lg bg-background hover:bg-primary/5 transition-colors">
                  <Checkbox id={key} checked={!!symptoms[key]} onChange={() => toggleSymptom(key)} />
                  <label htmlFor={key} className="text-sm cursor-pointer flex-1">{label}</label>
                </div>
              ))}
            </div>
            {symptomsMsg && <p className={`text-sm mt-3 ${symptomsMsg.ok ? "text-green-600" : "text-red-500"}`}>{symptomsMsg.text}</p>}
            <Button onClick={handleSymptomsSubmit} disabled={symptomsLoading || !sessionId} className="w-full mt-4 rounded-xl bg-primary hover:bg-primary/90">
              {symptomsLoading ? "Saving..." : "Save Symptoms"}
            </Button>
          </CardContent>
        </Card>

        {/* ── Log Sleep ─────────────────────────────────────────────────── */}
        <Card className="shadow-md border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Log Sleep</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Hours slept</label>
                <input type="number" min={1} max={24} placeholder="e.g. 7" value={sleepHours} onChange={(e) => setSleepHours(e.target.value ? +e.target.value : "")} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium">Sleep quality</label>
                <select value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value as SleepQuality)} className={inputCls}>
                  <option value="">Select...</option>
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
              {sleepMsg && <p className={`text-sm ${sleepMsg.ok ? "text-green-600" : "text-red-500"}`}>{sleepMsg.text}</p>}
              <Button onClick={handleSleepSubmit} disabled={!sleepHours || !sleepQuality || sleepLoading || !sessionId} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                {sleepLoading ? "Saving..." : "Save Sleep"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}