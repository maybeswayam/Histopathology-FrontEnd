"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Database,
  Flame,
  Lock,
  Network,
  Server,
  Workflow,
} from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MarketingHeader } from "@/components/layout/marketing-header"
import { PageAtmosphere } from "@/components/layout/page-atmosphere"

const architecture = [
  {
    icon: Network,
    title: "Client (Next.js)",
    body: "React app for auth, upload, case review, and dashboard history. Talks to FastAPI for inference and Supabase for data.",
  },
  {
    icon: Server,
    title: "Inference API (FastAPI)",
    body: "Loads the MobileNetV2 checkpoint once, serves /predict and /predict-with-gradcam, returns JSON + base64 heatmap.",
  },
  {
    icon: BrainCircuit,
    title: "Model (PyTorch)",
    body: "Fine-tuned MobileNetV2 classifier (benign vs malignant) trained offline in the model/ workspace.",
  },
  {
    icon: Flame,
    title: "Grad-CAM",
    body: "Hook on the last conv block, backprop for the predicted class, overlay as a heatmap for explainability.",
  },
  {
    icon: Database,
    title: "Supabase",
    body: "Auth plus Postgres. analysis_history rows store prediction, confidence, probabilities, image, and heatmap (RLS per user).",
  },
  {
    icon: Lock,
    title: "Trust boundaries",
    body: "Intended-use gate, research framing, and “model suggestion” language — no LLM classifier, no diagnosis UX.",
  },
]

const decisions = [
  {
    title: "Why MobileNetV2",
    body: "Small, fast, and accurate enough for a slide demo on CPU. Transfer learning beats training a large model from scratch on limited data.",
  },
  {
    title: "Why CNN, not an LLM, for labels",
    body: "One source of truth for class labels. Chat / vision LLMs were removed from the prediction path to avoid invented diagnoses and leaked keys.",
  },
  {
    title: "Why Grad-CAM",
    body: "Cheap, model-native attention. It is not a clinical explanation — just a view into what the CNN looked at.",
  },
  {
    title: "Why Supabase",
    body: "Managed auth + Postgres + row-level security without standing up a custom backend for accounts and history.",
  },
  {
    title: "What is intentionally simple",
    body: "Synchronous Grad-CAM on the request thread and a single-process FastAPI worker. Queued jobs remain a scale-up step; auth, upload limits, storage buckets, and Docker/CI are already in place.",
  },
]

export default function NerdsPage() {
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
        <section className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
          <motion.div {...fade}>
            <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>

            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
              Space for nerds
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              How this actually works
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              The technical side of HistoAI — stack, model, explainability, and the
              decisions that shaped the prototype.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {architecture.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  className="rounded-2xl border border-subtle bg-panel/80 p-5 backdrop-blur"
                  {...(prefersReducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 12 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true, margin: "-40px" },
                        transition: { duration: 0.4, delay: index * 0.04 },
                      })}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Design decisions
            </h2>
            <div className="mt-6 space-y-4">
              {decisions.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-subtle bg-panel/70 px-5 py-4 backdrop-blur"
                >
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-2xl border border-subtle bg-panel/80 p-6 backdrop-blur">
            <div className="flex items-start gap-3">
              <Workflow className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pipeline in one line</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Supabase auth → upload slide → FastAPI MobileNetV2 inference → Grad-CAM →
                  save to analysis_history → dashboard list → case review modal.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/50 pt-10">
            <Button asChild size="lg" className="rounded-lg px-7">
              <Link href="/guide">
                See the user flow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="px-3 text-muted-foreground">
              <Link href="/">
                Back to homepage
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-subtle/60 bg-panel/70 py-6 text-center text-xs text-muted-foreground backdrop-blur-sm">
        HistoAI — research use only · technical overview
      </footer>
    </div>
  )
}
