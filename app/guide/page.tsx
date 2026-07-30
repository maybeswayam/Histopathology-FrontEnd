"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Layers3,
  ScanSearch,
  ShieldAlert,
  UploadCloud,
  UserRoundPlus,
} from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MarketingHeader } from "@/components/layout/marketing-header"
import { PageAtmosphere } from "@/components/layout/page-atmosphere"

const steps = [
  {
    icon: UserRoundPlus,
    title: "Create an account",
    body: "Sign up with email, then sign in. Your workspace is private to you.",
  },
  {
    icon: FlaskConical,
    title: "Accept the research terms",
    body: "The first time you open Analyze, you confirm this is a research / education prototype — not a medical device.",
  },
  {
    icon: UploadCloud,
    title: "Upload a slide",
    body: "Use a clear PNG or JPG histopathology image. Avoid huge TIFFs for this demo.",
  },
  {
    icon: ScanSearch,
    title: "Read the model suggestion",
    body: "You get a benign / malignant label, confidence, and probabilities. Treat it as an output to question, not a diagnosis.",
  },
  {
    icon: Layers3,
    title: "Inspect Grad-CAM",
    body: "The heatmap shows where the model paid attention. It is an explanation of the model, not proof of disease.",
  },
  {
    icon: CheckCircle2,
    title: "Review your history",
    body: "Saved analyses appear on your Dashboard. Open any case to compare the slide and Grad-CAM again.",
  },
]

export default function GuidePage() {
  const prefersReducedMotion = useReducedMotion()

  const fade = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <div className="relative flex min-h-screen flex-col bg-page-wash text-foreground">
      <PageAtmosphere />

      <MarketingHeader transparent />

      <main className="relative z-10 flex-1">
        <section className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
          <motion.div {...fade}>
            <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>

            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
              How to use HistoAI
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              A student research prototype, explained simply
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              This is a learning project built by a student. It shows how a CNN plus
              Grad-CAM can analyze histopathology images — for education and
              experimentation, never for real clinical decisions.
            </p>

            <div className="mt-6 rounded-2xl border border-subtle bg-panel/80 px-5 py-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <p className="text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">Important:</span>{" "}
                  HistoAI is not a diagnostic tool. Any prediction is a model suggestion.
                  For anything clinical, a qualified pathologist must review the case.
                </p>
              </div>
            </div>
          </motion.div>

          <ol className="mt-16 space-y-10">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.li
                  key={step.title}
                  className="relative flex gap-5"
                  {...(prefersReducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 14 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true, margin: "-40px" },
                        transition: { duration: 0.45, delay: index * 0.03 },
                      })}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-panel/80 text-primary backdrop-blur">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    {index < steps.length - 1 ? (
                      <div className="mt-3 w-px flex-1 bg-border-subtle/60" aria-hidden />
                    ) : null}
                  </div>
                  <div className="pb-2 pt-1">
                    <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </ol>

          <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-white/50 pt-10">
            <Button asChild size="lg" className="rounded-lg px-7">
              <Link href="/auth/sign-up">
                Start with an account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="px-3 text-muted-foreground">
              <Link href="/">Back to homepage</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-subtle/60 bg-panel/70 py-6 text-center text-xs text-muted-foreground backdrop-blur-sm">
        HistoAI — student project · research use only
      </footer>
    </div>
  )
}
