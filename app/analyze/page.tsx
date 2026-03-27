"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { SimpleImageUpload } from "@/components/simple-image-upload"
import { ModernPredictionResults } from "@/components/modern-prediction-results"
import { unifiedAPI } from "@/services/unified-api"
import type { UnifiedPredictionResult } from "@/services/unified-api"
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layers3,
  LogOut,
  Microscope,
  RefreshCw,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react"

const workflowSteps = [
  {
    title: "Upload slide",
    detail: "The image is prepared in the browser before it is sent for inference.",
    icon: ImageIcon,
  },
  {
    title: "Run inference",
    detail: "The backend serves the saved MobileNetV2 checkpoint and returns class scores.",
    icon: Cpu,
  },
  {
    title: "Review evidence",
    detail: "Prediction, confidence, and Grad-CAM are returned together for inspection.",
    icon: Layers3,
  },
]

export default function AnalyzePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<UnifiedPredictionResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [heatmapImage, setHeatmapImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user

      if (!isMounted) {
        return
      }

      if (!currentUser) {
        router.replace("/auth/login")
        return
      }

      setUser(currentUser)
      setIsLoading(false)
    }

    void checkAuth()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  const handleImageUpload = (file: File) => {
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setHeatmapImage(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string
      setUploadedImage(imageUrl)

      try {
        const prediction = await unifiedAPI.predictCancer(file, "backend")
        setResult(prediction)
        setHeatmapImage(prediction.heatmap ?? null)

        if (user && imageUrl) {
          const { error: dbError } = await supabase.from("analysis_history").insert({
            user_id: user.id,
            prediction: prediction.prediction,
            confidence: prediction.confidence,
            image_url: imageUrl,
            probabilities: prediction.probabilities,
            heatmap: prediction.heatmap,
          })

          if (dbError) {
            throw new Error(`Database error: ${dbError.message}`)
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred."
        setError(errorMessage)
      } finally {
        setIsAnalyzing(false)
      }
    }

    reader.onerror = () => {
      setError("Failed to read the image file.")
      setIsAnalyzing(false)
    }

    reader.readAsDataURL(file)
  }

  const resetAnalysis = () => {
    setResult(null)
    setUploadedImage(null)
    setError(null)
    setHeatmapImage(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7fcf9_0%,#eefbf3_100%)] px-6">
        <div className="rounded-[32px] border border-emerald-100 bg-white px-8 py-10 text-center shadow-[0_26px_90px_-52px_rgba(22,101,52,0.32)]">
          <div className="mx-auto flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-emerald-100 border-t-emerald-600">
            <Microscope className="h-5 w-5 text-emerald-700" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            Preparing analysis workspace
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Restoring your secured session and loading the inference surface.
          </p>
        </div>
      </div>
    )
  }

  const confidencePercent = result ? Math.round(result.confidence * 100) : 0
  const resultLabel = result
    ? result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)
    : null
  const resultTone = result?.prediction === "malignant" ? "rose" : "emerald"

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fdf9_0%,#eefaf2_52%,#f8fcf9_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_14px_32px_-18px_rgba(22,101,52,0.5)]">
              <Microscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700/80">
                HistoAI
              </p>
              <h1 className="text-lg font-semibold text-slate-950">Analysis Studio</h1>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-emerald-200 bg-white px-4 text-emerald-800 hover:bg-emerald-50"
            >
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <Alert className="border-rose-200 bg-rose-50/70 text-rose-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {!result ? (
          <section className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <div className="flex h-full flex-col rounded-[32px] border border-emerald-100 bg-white p-7 shadow-[0_20px_70px_-45px_rgba(22,101,52,0.25)] sm:p-9">
              <div className="max-w-4xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
                  Analyze slide
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Run a new histopathology scan
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                  Upload one slide image to generate the benign or malignant
                  prediction, confidence scores, and Grad-CAM visual evidence in
                  a single workspace.
                </p>
              </div>

              <div className="mt-8 flex-1">
                <SimpleImageUpload
                  onImageUpload={handleImageUpload}
                  isLoading={isAnalyzing}
                />
              </div>
            </div>

            <aside className="h-full">
              <div className="flex h-full flex-col rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(22,101,52,0.18)]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                    Session
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Current run context
                  </h3>

                  <div className="mt-5 rounded-[24px] bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
                    <p className="text-sm text-slate-600">Signed in as</p>
                    <p className="mt-2 break-all text-base font-medium text-slate-950">
                      {user?.email}
                    </p>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[24px] border border-emerald-100">
                    <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-white px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Active model</p>
                          <p className="text-sm text-slate-500">MobileNetV2 checkpoint</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-white px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                          <Layers3 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Explainability</p>
                          <p className="text-sm text-slate-500">Grad-CAM returned with results</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-white px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Inference path</p>
                          <p className="text-sm text-slate-500">Backend API over protected session</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-emerald-100 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                    Workflow
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    What happens after upload
                  </h3>

                  <div className="mt-5 space-y-4">
                    {workflowSteps.map((step, index) => {
                      const Icon = step.icon

                      return (
                        <div key={step.title} className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                                {`0${index + 1}`}
                              </span>
                              <p className="text-sm font-semibold text-slate-950">
                                {step.title}
                              </p>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <>
            <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(22,101,52,0.25)] sm:p-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
                    Analysis complete
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {resultLabel} detected at {confidencePercent}% confidence
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                    Review the uploaded slide, compare it with the Grad-CAM
                    overlay, and confirm the backend classification output
                    before starting the next run.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                      resultTone === "rose"
                        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {resultLabel}
                  </span>
                  <Button
                    onClick={resetAnalysis}
                    variant="outline"
                    className="rounded-full border-emerald-200 bg-white px-5 text-emerald-800 hover:bg-emerald-50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New analysis
                  </Button>
                </div>
              </div>
            </section>

            <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.42fr)_380px]">
              <div className="rounded-[32px] border border-emerald-100 bg-white p-5 shadow-[0_20px_70px_-45px_rgba(22,101,52,0.2)] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                      Visual review
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      Original slide and Grad-CAM
                    </h3>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-slate-500">
                    Inspect both views side by side before you archive or rerun
                    the scan.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center gap-3 border-b border-emerald-100 px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                          Original image
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Uploaded source frame
                        </p>
                      </div>
                    </div>
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Uploaded histopathology slide"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center gap-3 border-b border-emerald-100 px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <Layers3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                          Grad-CAM overlay
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Visual explanation map
                        </p>
                      </div>
                    </div>
                    {heatmapImage ? (
                      <img
                        src={heatmapImage}
                        alt="Grad-CAM heatmap"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center px-6 text-center">
                        <p className="max-w-xs text-sm leading-7 text-slate-500">
                          Heatmap output is not available for this run.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ModernPredictionResults results={result} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
