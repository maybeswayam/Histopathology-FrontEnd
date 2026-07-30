"use client"

import type { ReactNode } from "react"
import { Layers3, ShieldCheck, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CaseReviewData {
  prediction: string
  confidence: number
  probabilities?: { benign: number; malignant: number } | null
  imageUrl?: string | null
  heatmapUrl?: string | null
  meta?: ReactNode
  abstain?: boolean
  modelVersion?: string | null
}

interface CaseReviewProps {
  data: CaseReviewData
  className?: string
  /** @deprecated Prefer variant="modal" */
  compactImages?: boolean
  showDisclaimer?: boolean
  /** page = analyze results; modal = history lightbox */
  variant?: "page" | "modal"
}

function ProbabilityBars({
  probabilities,
  compact = false,
}: {
  probabilities: { benign: number; malignant: number }
  compact?: boolean
}) {
  const benignPct = Math.round(probabilities.benign * 100)
  const malignantPct = Math.round(probabilities.malignant * 100)

  return (
    <div className={cn("grid gap-4", compact && "sm:grid-cols-2 sm:gap-6")}>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">Benign</span>
          <span className="font-display text-sm font-semibold tabular-nums text-benign">
            {benignPct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-benign/15">
          <div
            className="h-full rounded-full bg-benign transition-[width] duration-500 ease-out"
            style={{ width: `${benignPct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">Malignant</span>
          <span className="font-display text-sm font-semibold tabular-nums text-malignant">
            {malignantPct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-malignant/15">
          <div
            className="h-full rounded-full bg-[var(--malignant)] transition-[width] duration-500 ease-out"
            style={{ width: `${malignantPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function SlideFrame({
  title,
  hint,
  children,
  tall = false,
}: {
  title: string
  hint: string
  children: ReactNode
  tall?: boolean
}) {
  return (
    <figure className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-subtle bg-panel">
      <figcaption className="border-b border-subtle px-4 py-2.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </figcaption>
      <div
        className={cn(
          "flex flex-1 items-center justify-center bg-muted/50 p-3",
          tall ? "min-h-[240px]" : "min-h-[200px]",
        )}
      >
        {children}
      </div>
    </figure>
  )
}

export function CaseReview({
  data,
  className,
  compactImages = false,
  showDisclaimer = true,
  variant,
}: CaseReviewProps) {
  const layout = variant ?? (compactImages ? "modal" : "page")
  const isAbstain = Boolean(data.abstain)
  const isMalignant = !isAbstain && data.prediction?.toLowerCase() === "malignant"
  const confidencePercent = Math.round(data.confidence * 100)
  const label = isAbstain ? "Inconclusive" : isMalignant ? "Malignant" : "Benign"

  if (layout === "modal") {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <SlideFrame title="Original image" hint="Uploaded slide">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="Uploaded histopathology slide"
                className="max-h-[46vh] w-full object-contain"
              />
            ) : (
              <p className="text-sm text-muted-foreground">No image available</p>
            )}
          </SlideFrame>
          <SlideFrame title="Grad-CAM" hint="Model attention">
            {data.heatmapUrl ? (
              <img
                src={data.heatmapUrl}
                alt="Grad-CAM model attention heatmap"
                className="max-h-[46vh] w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <Layers3 className="mb-2 h-7 w-7 text-muted-foreground/50" aria-hidden />
                <p className="text-sm font-medium text-foreground">No heatmap</p>
                <p className="mt-1 max-w-[16rem] text-xs leading-5 text-muted-foreground">
                  Attention overlay was not saved for this case.
                </p>
              </div>
            )}
          </SlideFrame>
        </div>

        {data.probabilities || data.meta ? (
          <div className="rounded-2xl border border-subtle bg-panel px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              {data.probabilities ? (
                <ProbabilityBars probabilities={data.probabilities} compact />
              ) : (
                <div />
              )}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-display text-xl font-semibold tabular-nums text-foreground">
                  {confidencePercent}%
                </p>
              </div>
            </div>
            {data.meta ? <div className="mt-3">{data.meta}</div> : null}
          </div>
        ) : null}

        {showDisclaimer ? (
          <p className="text-[11px] leading-relaxed text-muted-foreground" role="note">
            Research and educational use only. Model suggestion — not a medical diagnosis. Grad-CAM
            shows attention, not proof of disease.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showDisclaimer ? (
        <p className="text-xs leading-5 text-muted-foreground" role="note">
          Research and educational use only. This is a{" "}
          <strong className="font-medium text-foreground">model suggestion</strong>, not a medical
          diagnosis. Grad-CAM shows model attention, not definitive evidence of disease.
        </p>
      ) : null}

      <section className="rounded-panel border border-subtle bg-panel px-4 py-4 panel-shadow sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isAbstain
                  ? "bg-muted text-muted-foreground"
                  : isMalignant
                    ? "bg-malignant-muted text-malignant"
                    : "bg-benign-muted text-benign",
              )}
            >
              {isAbstain || isMalignant ? (
                <TriangleAlert className="h-5 w-5" aria-hidden />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Model suggestion
              </p>
              <p
                className={cn(
                  "font-display truncate text-xl font-semibold tracking-tight sm:text-2xl",
                  isAbstain
                    ? "text-foreground"
                    : isMalignant
                      ? "text-malignant"
                      : "text-benign",
                )}
              >
                {label}
              </p>
              {data.modelVersion ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{data.modelVersion}</p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Confidence
            </p>
            <p className="font-display text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
              {confidencePercent}%
            </p>
          </div>
        </div>

        {isAbstain ? (
          <p className="mt-3 border-t border-subtle pt-3 text-sm leading-6 text-muted-foreground">
            Confidence is below the research abstain threshold. Treat this as inconclusive —
            do not use it as a class label.
          </p>
        ) : null}

        {data.probabilities ? (
          <div className="mt-3 border-t border-subtle pt-3">
            <ProbabilityBars probabilities={data.probabilities} compact />
          </div>
        ) : null}
      </section>

      {data.meta ? <div>{data.meta}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <SlideFrame title="Original image" hint="Uploaded slide" tall>
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Uploaded histopathology slide"
              className="max-h-[400px] w-full object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No image available</p>
          )}
        </SlideFrame>
        <SlideFrame title="Grad-CAM" hint="Model attention" tall>
          {data.heatmapUrl ? (
            <img
              src={data.heatmapUrl}
              alt="Grad-CAM model attention heatmap"
              className="max-h-[400px] w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <Layers3 className="mb-2 h-8 w-8 text-muted-foreground/50" aria-hidden />
              <p className="text-sm font-medium text-foreground">No heatmap available</p>
            </div>
          )}
        </SlideFrame>
      </section>
    </div>
  )
}
