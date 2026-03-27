"use client"

import { Progress } from "@/components/ui/progress"
import type { UnifiedPredictionResult } from "@/services/unified-api"

interface ModernPredictionResultsProps {
  results: UnifiedPredictionResult
}

export function ModernPredictionResults({
  results,
}: ModernPredictionResultsProps) {
  const isMalignant = results.prediction === "malignant"
  const confidencePercent = Math.round(results.confidence * 100)
  const benignProbability = Math.round((results.probabilities?.benign ?? 0) * 100)
  const malignantProbability = Math.round(
    (results.probabilities?.malignant ?? 0) * 100,
  )

  return (
    <div className="rounded-[32px] border border-emerald-100 bg-white p-8 text-center shadow-[0_20px_70px_-45px_rgba(22,101,52,0.2)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
        Prediction
      </p>

      <p
        className={`mt-6 text-5xl font-semibold tracking-tight sm:text-6xl ${
          isMalignant ? "text-rose-500" : "text-emerald-600"
        }`}
      >
        {isMalignant ? "Malignant" : "Benign"}
      </p>

      <p className="mt-3 text-xl text-slate-700 sm:text-2xl">
        {confidencePercent}% confidence
      </p>

      <div className="mt-10 space-y-6 text-left">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Benign</span>
            <span className="font-medium text-slate-700">{benignProbability}%</span>
          </div>
          <Progress
            value={benignProbability}
            className="h-2.5 bg-emerald-100/80"
            indicatorClassName="bg-emerald-300"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Malignant</span>
            <span className="font-medium text-slate-700">
              {malignantProbability}%
            </span>
          </div>
          <Progress
            value={malignantProbability}
            className="h-2.5 bg-rose-100/80"
            indicatorClassName="bg-rose-500"
          />
        </div>
      </div>
    </div>
  )
}
