import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "../../components/ui/button"
import { Crown, Heart, Shield, ChevronRight, ChevronLeft } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { getOrCreateSession, saveProfile, UserProfileRequest } from "../../lib/api"

type Step = "welcome" | "profile" | "health"

export function OnboardingScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("welcome")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profile, setProfile] = useState<Omit<UserProfileRequest, "session_id">>({
    full_name: "",
    age: undefined,
    weight_kg: undefined,
    height_cm: undefined,
    is_pregnant: false,
    birth_control_method: "",
    periods_regular: undefined,
    health_conditions: [],
  })

  const updateProfile = (fields: Partial<typeof profile>) =>
    setProfile((p) => ({ ...p, ...fields }))

  const handleContinue = async () => {
    if (step === "welcome") { setStep("profile"); return }
    if (step === "profile") { setStep("health"); return }

    // Final step — save profile
    setLoading(true)
    setError(null)
    try {
      const session_id = await getOrCreateSession()
      await saveProfile({ session_id, ...profile })
      navigate("/app")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // ── Step: Welcome ──────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gradient-to-b from-primary/5 to-background">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6">
            <Crown className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-primary text-center mb-3">
            Welcome to Ohemaa.ai
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Your AI-powered companion for PCOS awareness and wellness
          </p>

          <div className="w-full space-y-4 mb-8">
            {[
              { icon: Heart, title: "Understand Your Cycle", desc: "Track your period, symptoms, and get personalized insights" },
              { icon: Shield, title: "Early Detection", desc: "AI-powered screening for PCOS risk using your camera" },
              { icon: Crown, title: "Culturally Relevant", desc: "Local foods, trusted advice, and support from your community" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-8 space-y-3">
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-base bg-primary hover:bg-primary/90 rounded-xl"
          >
            Get Started
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Safe, private, and built for African women
          </p>
        </div>
      </div>
    )
  }

  // ── Step: Basic Profile ────────────────────────────────────────────────────
  if (step === "profile") {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto px-6 pt-12 pb-8">
        <button onClick={() => setStep("welcome")} className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-primary mb-1">Tell us about yourself</h1>
        <p className="text-sm text-muted-foreground mb-6">This helps personalize your health insights</p>

        <div className="space-y-4 flex-1">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Abena Mensah"
              value={profile.full_name ?? ""}
              onChange={(e) => updateProfile({ full_name: e.target.value })}
              className="mt-1 w-full h-12 rounded-xl border border-border px-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Age</label>
              <input
                type="number"
                placeholder="25"
                value={profile.age ?? ""}
                onChange={(e) => updateProfile({ age: e.target.value ? +e.target.value : undefined })}
                className="mt-1 w-full h-12 rounded-xl border border-border px-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Weight (kg)</label>
              <input
                type="number"
                placeholder="65"
                value={profile.weight_kg ?? ""}
                onChange={(e) => updateProfile({ weight_kg: e.target.value ? +e.target.value : undefined })}
                className="mt-1 w-full h-12 rounded-xl border border-border px-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Height (cm)</label>
            <input
              type="number"
              placeholder="162"
              value={profile.height_cm ?? ""}
              onChange={(e) => updateProfile({ height_cm: e.target.value ? +e.target.value : undefined })}
              className="mt-1 w-full h-12 rounded-xl border border-border px-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          onClick={handleContinue}
          className="w-full h-14 text-base bg-primary hover:bg-primary/90 rounded-xl mt-8"
        >
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  // ── Step: Health Info ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-6 pt-12 pb-8">
      <button onClick={() => setStep("profile")} className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-primary mb-1">Health background</h1>
      <p className="text-sm text-muted-foreground mb-6">Used only for PCOS risk assessment</p>

      <div className="space-y-4 flex-1">
        <div>
          <label className="text-sm font-medium">Are your periods regular?</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {([{ label: "Yes", val: true }, { label: "No", val: false }, { label: "Not sure", val: undefined }] as const).map(
              ({ label, val }) => (
                <button
                  key={label}
                  onClick={() => updateProfile({ periods_regular: val })}
                  className={`h-10 rounded-xl text-sm border-2 transition-colors ${
                    profile.periods_regular === val
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Birth control method</label>
          <select
            value={profile.birth_control_method ?? ""}
            onChange={(e) => updateProfile({ birth_control_method: e.target.value })}
            className="mt-1 w-full h-12 rounded-xl border border-border px-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">None / prefer not to say</option>
            <option value="pill">Contraceptive pill</option>
            <option value="implant">Implant</option>
            <option value="iud">IUD</option>
            <option value="injection">Injection</option>
            <option value="condom">Condom</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Known health conditions</label>
          <div className="grid grid-cols-2 gap-2">
            {["Diabetes", "Thyroid disorder", "Hypertension", "PCOS (diagnosed)", "Insulin resistance", "None"].map((cond) => {
              const selected = profile.health_conditions?.includes(cond)
              return (
                <button
                  key={cond}
                  onClick={() => {
                    const curr = profile.health_conditions ?? []
                    updateProfile({
                      health_conditions: selected ? curr.filter((c) => c !== cond) : [...curr, cond],
                    })
                  }}
                  className={`h-10 rounded-xl text-xs border-2 transition-colors px-2 ${
                    selected
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {cond}
                </button>
              )
            })}
          </div>
        </div>

        <Card className="border-none bg-primary/5">
          <CardContent className="p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.is_pregnant ?? false}
                onChange={(e) => updateProfile({ is_pregnant: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">I am currently pregnant</span>
            </label>
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center mt-4">{error}</p>
      )}

      <Button
        onClick={handleContinue}
        disabled={loading}
        className="w-full h-14 text-base bg-primary hover:bg-primary/90 rounded-xl mt-8"
      >
        {loading ? "Setting up your profile..." : "Start My Journey 👑"}
      </Button>
    </div>
  )
}