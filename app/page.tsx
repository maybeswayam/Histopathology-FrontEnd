"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { ArrowRight, Layers3, ScanSearch, UploadCloud } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"
import { MarketingHeader } from "@/components/layout/marketing-header"

const DarkVeil = dynamic(
  () => import("@/components/landing/dark_veil").then((mod) => mod.default),
  { ssr: false },
)

const steps = [
  {
    icon: UploadCloud,
    title: "Upload a slide",
    body: "Add a histopathology image for research analysis.",
  },
  {
    icon: ScanSearch,
    title: "Run the model",
    body: "Receive a benign or malignant prediction with confidence scores.",
  },
  {
    icon: Layers3,
    title: "Review attention",
    body: "Inspect the Grad-CAM overlay to see where the model focused — model attention, not proof of disease.",
  },
]

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  const [showVeil, setShowVeil] = useState(false)

  useEffect(() => {
    if (!prefersReducedMotion) setShowVeil(true)
  }, [prefersReducedMotion])

  const fade = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      {showVeil ? (
        <div className="pointer-events-none fixed inset-0 z-0 bg-white" aria-hidden>
          <div className="absolute inset-0 opacity-[0.98]">
            <DarkVeil
              hueShift={130}
              noiseIntensity={0.06}
              scanlineIntensity={0.1}
              scanlineFrequency={400}
              speed={0.4}
              warpAmount={0.3}
            />
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-page-wash" aria-hidden />
      )}

      <MarketingHeader transparent />

      <main className="relative z-10 flex-1">
        {/* Hero — v1 composition, current type + veil */}
        <section className="flex min-h-screen w-full flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6">
          <motion.div className="mx-auto w-full max-w-4xl" {...fade}>
            <div className="mb-8 flex justify-center">
              <Logo href={null} size="hero" emphasize />
            </div>

            <h1 className="mt-2 text-balance font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Intelligent histopathology
              <span className="block bg-gradient-to-r from-primary via-emerald-600 to-lime-600 bg-clip-text text-transparent">
                cancer analysis
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Upload a slide, get a model prediction with confidence scores, and
              review Grad-CAM attention maps. Built for research and education —
              not clinical diagnosis.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-lg px-7">
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-lg bg-panel/80 px-7 backdrop-blur"
              >
                <Link href="/guide">New here? See how it works</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* How it works — transparent, icon-led, on the veil */}
        <section className="border-t border-white/40 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="font-display text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
              Three steps from slide to interpretable output.
            </p>

            <ol className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <li key={step.title} className="relative flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-subtle/80 bg-panel/80 text-primary backdrop-blur-sm">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                    {index < steps.length - 1 ? (
                      <ArrowRight
                        className="absolute -right-10 top-5 hidden h-5 w-5 text-primary/50 sm:block"
                        aria-hidden
                      />
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* Trust / limitations */}
        <section className="border-t border-white/40 bg-panel/50 py-20 backdrop-blur-sm sm:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Intended use
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              HistoAI is a research and educational tool for exploring AI-assisted
              histopathology analysis. Predictions are model outputs, not medical
              diagnoses. Grad-CAM highlights model attention and should not be
              treated as definitive evidence of disease. Always follow institutional
              review and clinical standards for patient care.
            </p>
            <div className="mt-10">
              <Button asChild variant="outline" size="lg" className="rounded-lg px-7">
                <Link href="/auth/sign-up">Get started with HistoAI</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
