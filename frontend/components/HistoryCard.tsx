"use client"

import { ArrowUpRight, CalendarDays, Layers3, ShieldCheck, TriangleAlert } from "lucide-react"
import { Card } from "@/components/ui/card"

export interface HistoryAnalysis {
  id: string
  created_at: string
  prediction: string
  confidence: number
  image_url: string
  heatmap?: string | null
  probabilities?: {
    benign: number
    malignant: number
  } | null
}

interface HistoryCardProps {
  analysis: HistoryAnalysis
}

export function HistoryCard({ analysis }: HistoryCardProps) {
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
    <Card className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white p-4 shadow-[0_16px_50px_-34px_rgba(22,101,52,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_65px_-32px_rgba(22,101,52,0.28)]">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 md:w-48 md:shrink-0">
          <img
            src={analysis.image_url}
            alt={`Analysis ${analysis.id}`}
            className="aspect-[4/3] h-full w-full object-cover"
          />
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
              isMalignant
                ? "bg-rose-600 text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {isMalignant ? <TriangleAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            {analysis.prediction}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Saved analysis
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {formattedDate}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                {formattedTime}
              </div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                {analysis.heatmap
                  ? "Open this case to compare the original image with the Grad-CAM overlay."
                  : "Open this case to review the original image and stored classification details."}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <div className="rounded-2xl bg-emerald-50/70 px-4 py-3 text-right ring-1 ring-emerald-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                  Confidence
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {confidencePercent}%
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white transition group-hover:bg-emerald-700">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50/60 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                Prediction
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {analysis.prediction}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50/60 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                Heatmap
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Layers3 className="h-4 w-4 text-emerald-600" />
                {analysis.heatmap ? "Available" : "Missing"}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50/60 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                Review
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                Open full case details
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
