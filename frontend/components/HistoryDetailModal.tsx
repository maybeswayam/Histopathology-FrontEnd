"use client"

import type { ReactNode } from "react"
import { CalendarDays, X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { HistoryAnalysis } from "@/types/analysis"
import { resolveHeatmap } from "@/types/analysis"
import { CaseReview } from "@/components/case/case-review"

interface HistoryDetailModalProps {
  analysis: HistoryAnalysis
  children: ReactNode
}

export function HistoryDetailModal({
  analysis,
  children,
}: HistoryDetailModalProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(analysis.created_at))

  const shortId = analysis.id.slice(0, 8)
  const isMalignant = analysis.prediction?.toLowerCase() === "malignant"

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="
          flex max-h-[92vh] w-[min(95vw,56rem)] max-w-4xl flex-col gap-0 overflow-hidden
          rounded-panel border border-subtle bg-panel p-0 panel-shadow
          [&>button]:hidden
        "
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-subtle px-5 py-4 sm:px-6">
          <DialogHeader className="min-w-0 space-y-0 text-left">
            <DialogTitle className="font-display text-base font-semibold tracking-tight text-foreground">
              Case review
            </DialogTitle>
            <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {formattedDate}
              </span>
              <span className="hidden text-border sm:inline" aria-hidden>
                ·
              </span>
              <span className="font-mono text-[11px] text-muted-foreground/80">#{shortId}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-semibold",
                isMalignant ? "bg-malignant-muted text-malignant" : "bg-benign-muted text-benign",
              )}
            >
              {isMalignant ? "Malignant" : "Benign"}
            </span>
            <DialogClose asChild>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <CaseReview
            variant="modal"
            data={{
              prediction: analysis.prediction,
              confidence: analysis.confidence,
              probabilities: analysis.probabilities,
              imageUrl: analysis.image_url,
              heatmapUrl: resolveHeatmap(analysis),
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
