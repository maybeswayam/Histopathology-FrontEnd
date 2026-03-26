"use client"

import {
  CalendarDays,
  Gauge,
  Layers3,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { HistoryAnalysis } from "@/components/HistoryCard"

interface HistoryDetailModalProps {
  analysis: HistoryAnalysis
  children: React.ReactNode
}

export function HistoryDetailModal({
  analysis,
  children,
}: HistoryDetailModalProps) {
  const confidencePercent = Math.round(analysis.confidence * 100)
  const isMalignant = analysis.prediction === "malignant"
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(analysis.created_at))

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="
          flex max-h-[92vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden
          rounded-2xl border border-emerald-100 bg-white p-0 shadow-[0_28px_90px_-36px_rgba(22,101,52,0.28)]
          [&>button]:hidden
        "
      >
        <div className="flex items-center justify-between gap-4 border-b border-emerald-100 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                isMalignant
                  ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                  : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
              }`}
            >
              {isMalignant ? (
                <TriangleAlert className="h-3 w-3" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              {analysis.prediction}
            </span>

            <DialogHeader className="text-left">
              <DialogTitle className="text-base leading-none font-semibold text-slate-900">
                Analysis details
              </DialogTitle>
              <DialogDescription className="sr-only">
                Review the original image and the Grad-CAM overlay for this analysis.
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogClose asChild>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700">
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>

        <div className="flex items-center gap-0 divide-x divide-emerald-100 border-b border-emerald-100 bg-emerald-50/60">
          <div className="flex items-center gap-2 px-5 py-3">
            <Gauge className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-800/70">
              Confidence
            </span>
            <span className="ml-1.5 text-sm font-bold text-slate-900">
              {confidencePercent}%
            </span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-800/70">
              Recorded
            </span>
            <span className="ml-1.5 text-sm font-semibold text-slate-900">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-emerald-100 overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="flex min-h-0 flex-col gap-3 p-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Original image</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Uploaded source for this analysis
              </p>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/50">
              <img
                src={analysis.image_url}
                alt="Original histopathology image"
                className="max-h-full max-w-full object-contain"
                style={{ maxHeight: "calc(92vh - 200px)" }}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-3 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Grad-CAM overlay
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Model attention heatmap
                </p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Layers3 className="h-3.5 w-3.5" />
              </div>
            </div>

            {analysis.heatmap ? (
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/50">
                <img
                  src={analysis.heatmap}
                  alt="Grad-CAM heatmap"
                  className="max-h-full max-w-full object-contain"
                  style={{ maxHeight: "calc(92vh - 200px)" }}
                />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-6 text-center">
                <Layers3 className="mb-3 h-8 w-8 text-emerald-300" />
                <p className="text-sm font-semibold text-slate-700">
                  No heatmap available
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  This case was saved without a Grad-CAM overlay.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
