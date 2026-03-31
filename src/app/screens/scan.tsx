import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import {
  Camera,
  Upload,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Aperture,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import {
  analyzeScan,
  getOrCreateSession,
  ScanResult,
  ScanType,
} from "../../lib/api"

const SCAN_TYPES: { value: ScanType; label: string }[] = [
  { value: "face", label: "Face" },
  { value: "neck", label: "Neck" },
  { value: "scalp", label: "Scalp" },
  { value: "abdomen", label: "Abdomen" },
  { value: "back", label: "Back" },
]

function scoreToPercent(score: number) {
  return Math.round(score * 100)
}

function scoreColor(score: number) {
  if (score < 0.33) return "text-green-600"
  if (score < 0.66) return "text-yellow-600"
  return "text-red-600"
}

export function ScanScreen() {
  const [scanStage, setScanStage] = useState<"intro" | "camera" | "scanning" | "results">("intro")
  const [scanType, setScanType] = useState<ScanType>("face")
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    getOrCreateSession().then(setSessionId).catch(console.error)
  }, [])

  // Cleanup camera stream when leaving camera stage or unmounting
  useEffect(() => {
    if (scanStage !== "camera" && stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
  }, [scanStage, stream])

  useEffect(() => {
    if (scanStage === "camera" && videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream
      }
    }
  }, [scanStage, stream])

  const runScan = async (file: File) => {
    if (!sessionId) { setError("Session not ready. Please wait."); return }
    setError(null)
    setScanStage("scanning")
    setProgress(20)

    // Animate progress while waiting
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 85))
    }, 600)

    try {
      const res = await analyzeScan(sessionId, scanType, file)
      clearInterval(timer)
      setProgress(100)
      setResult(res)
      setScanStage("results")
    } catch (e) {
      clearInterval(timer)
      setError(e instanceof Error ? e.message : "Scan failed. Please try again.")
      setScanStage("intro")
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) runScan(file)
  }

  const startCamera = async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      setStream(mediaStream)
      setScanStage("camera")
      // We set the srcObject in a slightly delayed effect or ref callback,
      // but since videoRef will mount in the "camera" stage, we can attach it
      // when the video element renders.
    } catch (err) {
      setError("Camera access denied or unavailable. Please upload a photo instead.")
    }
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" })
          runScan(file)
        }
      }, "image/jpeg", 0.9)
    }
  }

  const riskLevel = result
    ? result.hyperandrogenism_confidence < 0.33
      ? "low"
      : result.hyperandrogenism_confidence < 0.66
      ? "moderate"
      : "high"
    : "low"

  const riskBadgeColor =
    riskLevel === "low"
      ? "bg-green-100 text-green-700"
      : riskLevel === "moderate"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <h1 className="text-2xl font-bold mb-2">Ohemaa Scan</h1>
        <p className="text-sm text-white/80">AI-powered PCOS risk screening</p>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* ── Intro ─────────────────────────────────────────────────────── */}
        {scanStage === "intro" && (
          <>
            <Card className="shadow-sm border-none bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Your Privacy Matters</h3>
                    <p className="text-xs text-muted-foreground">
                      Images are securely analysed by Gemini Vision and deleted immediately after processing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scan type selector */}
            <Card className="shadow-md border-none">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Select area to scan</h3>
                <div className="grid grid-cols-5 gap-2">
                  {SCAN_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setScanType(value)}
                      className={`py-2 rounded-xl text-xs font-medium transition-colors border-2 ${
                        scanType === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Camera preview placeholder */}
            <Card className="shadow-md border-none">
              <CardContent className="p-0">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-xl flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Scanning: <span className="font-medium capitalize text-primary">{scanType}</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-b-xl">
                  <h3 className="font-semibold mb-2">How to scan:</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><span className="font-semibold text-foreground">1.</span>Choose an area with good natural lighting</li>
                    <li className="flex gap-2"><span className="font-semibold text-foreground">2.</span>Select the body area above</li>
                    <li className="flex gap-2"><span className="font-semibold text-foreground">3.</span>Take a photo or upload an existing one</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

            <div className="space-y-3">
              <Button
                onClick={startCamera}
                disabled={!sessionId}
                className="w-full h-14 text-base bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo & Scan
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!sessionId}
                className="w-full h-14 text-base rounded-xl border-2"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Existing Photo
              </Button>
            </div>

            <Card className="shadow-sm border-none">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">What we look for</h3>
                    <p className="text-xs text-muted-foreground">
                      Our AI analyses hirsutism, acne, alopecia, acanthosis nigricans, and oily skin — key visual signs of hyperandrogenism linked to PCOS.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Camera Interface ──────────────────────────────────────────── */}
        {scanStage === "camera" && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="p-4 flex justify-between items-center text-white bg-black/50 absolute top-0 left-0 right-0 z-10">
              <h2 className="font-semibold px-2 text-lg">Frame your face</h2>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setScanStage("intro")}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover transform scale-x-[-1]"
                playsInline
                autoPlay
                muted
              />
              
              {/* Face Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-80 border-2 border-white/50 rounded-[4rem] border-dashed" />
              </div>
            </div>

            <div className="bg-black pb-12 pt-6 px-6 flex justify-center items-center">
              <button 
                onClick={captureFrame}
                className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <Aperture className="w-8 h-8 text-black" />
                </div>
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* ── Scanning ──────────────────────────────────────────────────── */}
        {scanStage === "scanning" && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
              <Camera className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analysing Image...</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Gemini Vision is checking for PCOS indicators on your {scanType}
            </p>
            <Progress value={progress} className="w-64" />
            <p className="text-xs text-muted-foreground mt-3">This may take a few seconds</p>
          </div>
        )}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {scanStage === "results" && result && (
          <>
            <Card className="shadow-md border-none">
              <CardContent className="p-6 text-center">
                <div
                  className={`w-20 h-20 rounded-full ${
                    riskLevel === "low" ? "bg-green-100" : riskLevel === "moderate" ? "bg-yellow-100" : "bg-red-100"
                  } flex items-center justify-center mx-auto mb-4`}
                >
                  {riskLevel === "low" ? (
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  ) : (
                    <AlertCircle className={`w-10 h-10 ${scoreColor(result.hyperandrogenism_confidence)}`} />
                  )}
                </div>
                <Badge className={`${riskBadgeColor} mb-3`}>
                  {riskLevel.toUpperCase()} HYPERANDROGENISM RISK
                </Badge>
                <h3 className="text-2xl font-bold mb-2">
                  {scoreToPercent(result.hyperandrogenism_confidence)}% Confidence
                </h3>
                <p className="text-sm text-muted-foreground capitalize">Scan area: {result.scan_type}</p>
              </CardContent>
            </Card>

            {/* Score breakdown */}
            <Card className="shadow-sm border-none">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Detailed Scores</h3>
                <div className="space-y-3">
                  {[
                    { label: "Hirsutism (excess hair)", score: result.hirsutism_score },
                    { label: "Acne", score: result.acne_score },
                    { label: "Alopecia (hair thinning)", score: result.alopecia_score },
                    { label: "Acanthosis nigricans", score: result.acanthosis_nigricans_score },
                    { label: "Oily skin", score: result.oily_skin_score },
                  ].map(({ label, score }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span className={`font-medium ${scoreColor(score)}`}>{scoreToPercent(score)}%</span>
                      </div>
                      <Progress value={scoreToPercent(score)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detected signs */}
            {result.detected_signs.length > 0 && (
              <Card className="shadow-sm border-none">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-3">Detected Signs</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.detected_signs.map((sign) => (
                      <Badge key={sign} variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200">
                        {sign}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm border-none bg-primary/5">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Next Steps:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-accent">•</span>Track your symptoms in the Cycle Tracker</li>
                  <li className="flex items-start gap-2"><span className="text-accent">•</span>Get your full Rotterdam Risk Report</li>
                  <li className="flex items-start gap-2"><span className="text-accent">•</span>Consider consulting a doctor for confirmation</li>
                </ul>
              </CardContent>
            </Card>

            <Button
              onClick={() => { setScanStage("intro"); setResult(null) }}
              variant="outline"
              className="w-full h-12 rounded-xl border-2"
            >
              Scan Again
            </Button>
          </>
        )}
      </div>
    </div>
  )
}