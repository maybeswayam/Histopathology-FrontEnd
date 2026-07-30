"use client"

import { ArrowUpRight, CalendarDays, Layers3, ShieldCheck, TriangleAlert } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  resolveHeatmap,
  type HistoryAnalysis,
} from "@/types/analysis"

export type { HistoryAnalysis }

interface HistoryCardProps {
  analysis: HistoryAnalysis
}

export function HistoryCard({ analysis }: HistoryCardProps) {
  const heatmap = resolveHeatmap(analysis)
  const isMalignant = analysis.prediction === "malignant"
  const confidencePercent = Math.round(analysis.confidence * 100)
  const date = new Date(analysis.created_at)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)

  return (
    <Card className="group overflow-hidden rounded-2xl border border-subtle bg-panel p-4 transition duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl border border-subtle bg-muted/50 sm:w-32">
          <img
            src={analysis.image_url}
            alt={`Analysis ${analysis.id}`}
            className="h-full w-full object-cover"
          />
          <span
            className={cn(
              "absolute left-2 top-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
              isMalignant ? "bg-malignant-muted text-malignant" : "bg-benign-muted text-benign",
            )}
          >
            {isMalignant ? (
              <TriangleAlert className="h-3 w-3" aria-hidden />
            ) : (
              <ShieldCheck className="h-3 w-3" aria-hidden />
            )}
            {analysis.prediction}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Saved analysis
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-base font-semibold text-foreground">{formattedDate}</h3>
              <span className="text-xs text-muted-foreground">· {formattedTime}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Confidence {confidencePercent}%
              {heatmap ? (
                <span className="inline-flex items-center gap-1.5">
                  {" "}
                  · <Layers3 className="h-3.5 w-3.5 text-primary" aria-hidden /> Grad-CAM
                </span>
              ) : (
                " · No heatmap"
              )}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
            <p className="font-display text-lg font-semibold tabular-nums text-foreground">
              {confidencePercent}%
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-subtle bg-muted/50 text-muted-foreground transition group-hover:border-primary/30 group-hover:text-primary">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
