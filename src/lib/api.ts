//use environment variable
const url = import.meta.env.VITE_API_URL
const BASE_URL =url 


// ─── Session ────────────────────────────────────────────────────────────────

const SESSION_KEY = "ohemaa_session_id"

export async function createSession(): Promise<string> {
  const res = await fetch(`${BASE_URL}/session/create`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to create session")
  const data: { session_id: string } = await res.json()
  return data.session_id
}

export async function getOrCreateSession(): Promise<string> {
  const stored = localStorage.getItem(SESSION_KEY)
  if (stored) return stored
  const id = await createSession()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatResponse {
  reply: string
}

export interface ScanResult {
  scan_id: string
  scan_type: string
  hirsutism_score: number
  acne_score: number
  alopecia_score: number
  acanthosis_nigricans_score: number
  oily_skin_score: number
  hyperandrogenism_confidence: number
  detected_signs: string[]
}

export type ScanType = "face" | "neck" | "scalp" | "abdomen" | "back"
export type FlowIntensity = "light" | "medium" | "heavy" | "none"
export type SleepQuality = "poor" | "fair" | "good" | "excellent"

export interface PeriodLogRequest {
  session_id: string
  period_start_date: string // YYYY-MM-DD
  period_end_date?: string
  flow_intensity?: FlowIntensity
  notes?: string
}

export interface PeriodLogResponse extends PeriodLogRequest {
  id: string
  created_at?: string
}

export interface SymptomLogRequest {
  session_id: string
  has_acne?: boolean
  has_hair_loss?: boolean
  has_weight_gain?: boolean
  has_fatigue?: boolean
  has_mood_swings?: boolean
  cramps?: boolean
  bloating?: boolean
  tender_breasts?: boolean
  backache?: boolean
  sleep_impact?: boolean
  sleep_hours?: number
  sleep_quality?: SleepQuality
  bmi?: number
  notes?: string
}

export interface SleepLogRequest {
  session_id: string
  sleep_hours: number
  sleep_quality: SleepQuality
  sleep_impact?: boolean
}

export interface UserProfileRequest {
  session_id: string
  full_name?: string
  age?: number
  year_of_birth?: number
  weight_kg?: number
  height_cm?: number
  is_pregnant?: boolean
  birth_control_method?: string
  health_conditions?: string[]
  periods_regular?: boolean
}

export interface UserProfileResponse extends UserProfileRequest {
  bmi?: number
}

export interface RotterdamRiskResponse {
  session_id: string
  overall_risk_level: "low" | "moderate" | "high"
  risk_percentage: number
  rotterdam_criteria_met: string[]
  criteria_count: number
  detailed_breakdown: Record<string, unknown>
  recommendation: string
}

export interface NutritionResponse {
  matched_food: string | null
  pcos_friendly: boolean | null
  gi_index: number | null
  recommendation: string
  alternatives: string[]
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export function sendChat(
  session_id: string,
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> {
  return post("/chat/", { session_id, message, history })
}

export async function analyzeScan(
  session_id: string,
  scan_type: ScanType,
  file: File
): Promise<ScanResult> {
  const form = new FormData()
  form.append("session_id", session_id)
  form.append("scan_type", scan_type)
  form.append("image", file)

  const res = await fetch(`${BASE_URL}/scan/analyze`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `Scan failed: ${res.status}`)
  }
  return res.json()
}

export function logPeriod(body: PeriodLogRequest): Promise<PeriodLogResponse> {
  return post("/onboarding/period-log", body)
}

export function logSymptoms(body: SymptomLogRequest): Promise<unknown> {
  return post("/onboarding/symptoms", body)
}

export function logSleep(body: SleepLogRequest): Promise<unknown> {
  return post("/onboarding/sleep", body)
}

export function computeRisk(session_id: string): Promise<RotterdamRiskResponse> {
  return post("/risk/compute", { session_id })
}

export function getLatestRisk(session_id: string): Promise<RotterdamRiskResponse | { message: string }> {
  return get(`/risk/latest?session_id=${encodeURIComponent(session_id)}`)
}

export function recommendNutrition(food_query: string): Promise<NutritionResponse> {
  return post("/nutrition/recommend", { food_query })
}

export function saveProfile(body: UserProfileRequest): Promise<UserProfileResponse> {
  return post("/onboarding/profile", body)
}

export function getProfile(session_id: string): Promise<UserProfileResponse> {
  return get(`/onboarding/profile?session_id=${encodeURIComponent(session_id)}`)
}
