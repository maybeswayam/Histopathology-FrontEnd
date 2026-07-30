"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Microscope, RefreshCw } from "lucide-react"
import { unifiedAPI, validateUploadFile } from "@/services/unified-api"
import type { UnifiedPredictionResult } from "@/services/unified-api"
import type { AnalysisHistoryInsert } from "@/types/analysis"
import { persistAnalysisMedia } from "@/lib/storage"
import { SimpleImageUpload } from "@/components/simple-image-upload"
import { CaseReview } from "@/components/case/case-review"
import { AppHeader } from "@/components/layout/app-header"
import { ResearchDisclaimer } from "@/components/research-disclaimer"
import { IntendedUseGate } from "@/components/intended-use-gate"
import Link from "next/link"

type AnalysisStage =
  | "idle"
  | "uploading"
  | "running"
  | "rendering"
  | "complete"

const STAGE_LABELS: Record<Exclude<AnalysisStage, "idle" | "complete">, string> = {
  uploading: "Uploading and reading image…",
  running: "Running model…",
  rendering: "Rendering Grad-CAM…",
}

export default function AnalyzePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [stage, setStage] = useState<AnalysisStage>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UnifiedPredictionResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [heatmapImage, setHeatmapImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [intendedUseAccepted, setIntendedUseAccepted] = useState(false)
  const [historySaved, setHistorySaved] = useState(false)
  const [historyWarning, setHistoryWarning] = useState<string | null>(null)
  const [backendDown, setBackendDown] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const uploadedFileRef = useRef<File | null>(null)

  const authBypass =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_AUTH_BYPASS === "true"

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }
      setUser(currentUser)
      setIsLoading(false)

      const healthy = await unifiedAPI.checkBackendHealth()
      setBackendDown(!healthy)
    }
    void checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auth check once on mount
  }, [])

  useEffect(() => {
    return () => {
      stageTimers.current.forEach(clearTimeout)
    }
  }, [])

  const clearStageTimers = () => {
    stageTimers.current.forEach(clearTimeout)
    stageTimers.current = []
  }

  const startClientStages = () => {
    clearStageTimers()
    setStage("uploading")
    setProgress(12)
    stageTimers.current.push(
      setTimeout(() => {
        setStage("running")
        setProgress(42)
      }, 600),
      setTimeout(() => {
        setStage("rendering")
        setProgress(78)
      }, 1800),
    )
  }

  const handleImageUpload = (file: File) => {
    const validationError = validateUploadFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    uploadedFileRef.current = file
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setHeatmapImage(null)
    setHistorySaved(false)
    setHistoryWarning(null)
    startClientStages()

    const reader = new FileReader()
    reader.onload = async (e) => {
      const previewUrl = e.target?.result as string
      setUploadedImage(previewUrl)

      try {
        setStage("running")
        setProgress(45)
        const prediction = await unifiedAPI.predictCancer(file)
        setStage("rendering")
        setProgress(85)
        clearStageTimers()
        setProgress(100)
        setStage("complete")
        setResult(prediction)
        if (prediction.heatmap) {
          setHeatmapImage(prediction.heatmap)
        }

        if (user && previewUrl) {
          if (authBypass) {
            setHistoryWarning(
              "Auth bypass is on — result was not saved. Set NEXT_PUBLIC_AUTH_BYPASS=false and configure Supabase in .env.local.",
            )
          } else {
            const analysisId = crypto.randomUUID()
            const media = await persistAnalysisMedia(supabase, {
              userId: user.id,
              analysisId,
              imageFile: file,
              heatmapDataUrl: prediction.heatmap,
            })
            if (!media.usedStorage) {
              setHistoryWarning(
                "Saved with inline image data. Create Supabase Storage buckets `slides` and `heatmaps` (see setup_supabase.sql) to avoid large database rows.",
              )
            }

            const row: AnalysisHistoryInsert = {
              user_id: user.id,
              prediction: prediction.prediction,
              confidence: prediction.confidence,
              image_url: media.image_url,
              probabilities: prediction.probabilities ?? null,
              heatmap: media.heatmap,
              heatmap_url: media.heatmap_url,
              processing_time: Math.round(prediction.processing_time),
              model_version: prediction.model_version ?? null,
            }
            const { error: dbError } = await supabase.from("analysis_history").insert(row)
            if (dbError) {
              // Retry without optional columns for older schemas
              const { model_version: _mv, heatmap_url: _hu, ...legacy } = row
              const retry = await supabase.from("analysis_history").insert(legacy)
              if (retry.error) {
                throw new Error(
                  `Could not save to history: ${dbError.message}. Run frontend/scripts/setup_supabase.sql in the Supabase SQL editor.`,
                )
              }
            }
            setHistorySaved(true)
            if (media.usedStorage) {
              setUploadedImage(media.image_url)
              if (media.heatmap) setHeatmapImage(media.heatmap)
            }
          }
        }
      } catch (err) {
        clearStageTimers()
        setStage("idle")
        setProgress(0)
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred."
        setError(errorMessage)
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.onerror = () => {
      clearStageTimers()
      setStage("idle")
      setProgress(0)
      setError("Failed to read the image file.")
      setIsAnalyzing(false)
    }
    reader.readAsDataURL(file)
  }

  const resetAnalysis = () => {
    clearStageTimers()
    setResult(null)
    setUploadedImage(null)
    setError(null)
    setHeatmapImage(null)
    setStage("idle")
    setProgress(0)
    setHistorySaved(false)
    setHistoryWarning(null)
    uploadedFileRef.current = null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-wash px-6">
        <div
          className="rounded-panel border border-subtle bg-panel px-8 py-10 text-center panel-shadow"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-primary/15 border-t-primary">
            <Microscope className="h-5 w-5 text-primary" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Loading workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Preparing the analysis surface.</p>
        </div>
      </div>
    )
  }

  const stageLabel =
    stage === "uploading" || stage === "running" || stage === "rendering"
      ? STAGE_LABELS[stage]
      : null

  return (
    <div className="min-h-screen bg-page-wash text-foreground">
      <AppHeader title="Analyze" showPrimaryAction={false} />
      <ResearchDisclaimer />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {authBypass && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Auth bypass is enabled. Sign-in and history saving are disabled. Set{" "}
              <code className="text-xs">NEXT_PUBLIC_AUTH_BYPASS=false</code> and add real Supabase
              keys in <code className="text-xs">.env.local</code> — see{" "}
              <code className="text-xs">docs/LOCAL_SETUP.md</code>.
            </AlertDescription>
          </Alert>
        )}

        {backendDown && (
          <Alert className="mb-6 border-amber-500/40 bg-amber-50 text-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <AlertDescription>
              Inference server is unreachable. Start the FastAPI backend (
              <code className="text-xs">cd backend && python run_server.py</code>) and ensure{" "}
              <code className="text-xs">NEXT_PUBLIC_BACKEND_URL</code> matches.
            </AlertDescription>
          </Alert>
        )}

        {!user ? null : (
          <IntendedUseGate
            userId={user.id}
            onAccepted={() => setIntendedUseAccepted(true)}
          >
            {error && (
              <Alert variant="destructive" className="mb-6" role="alert">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-destructive/30 bg-panel"
                    onClick={() => {
                      setError(null)
                      resetAnalysis()
                    }}
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!result && (
              <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Upload a slide
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                    Run a research model suggestion and Grad-CAM attention map on a
                    histopathology image. Outputs are for education and research — not clinical
                    diagnosis.
                  </p>
                </div>
                <SimpleImageUpload
                  onImageUpload={handleImageUpload}
                  isLoading={isAnalyzing}
                  stageLabel={stageLabel}
                  progress={progress}
                  disabled={!intendedUseAccepted || authBypass}
                />
              </div>
            )}

            {result && (
              <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Case review
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Model suggestion and Grad-CAM
                      {result.model_version ? ` · ${result.model_version}` : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {historySaved ? (
                      <Button asChild variant="default" className="rounded-lg">
                        <Link href="/dashboard">View on dashboard</Link>
                      </Button>
                    ) : null}
                    <Button onClick={resetAnalysis} variant="outline" className="rounded-lg">
                      <RefreshCw className="h-4 w-4" aria-hidden />
                      New analysis
                    </Button>
                  </div>
                </div>

                {historySaved && (
                  <Alert className="mb-5 border-primary/20 bg-primary/5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Saved to your analysis history. Open the dashboard to review this case later.
                    </AlertDescription>
                  </Alert>
                )}
                {historyWarning && (
                  <Alert className="mb-5 border-amber-500/30 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-700" />
                    <AlertDescription>{historyWarning}</AlertDescription>
                  </Alert>
                )}

                <CaseReview
                  variant="page"
                  data={{
                    prediction: result.prediction,
                    confidence: result.confidence,
                    probabilities: result.probabilities,
                    imageUrl: uploadedImage,
                    heatmapUrl: heatmapImage ?? result.heatmap,
                    abstain: result.abstain,
                    modelVersion: result.model_version,
                  }}
                />
              </div>
            )}
          </IntendedUseGate>
        )}
      </main>
    </div>
  )
}
