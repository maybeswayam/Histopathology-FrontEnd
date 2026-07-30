/** Canonical analysis_history row shape used by analyze, dashboard, and history UI. */
export interface ClassProbabilities {
  benign: number
  malignant: number
}

export interface HistoryAnalysis {
  id: string
  created_at: string
  prediction: string
  confidence: number
  image_url: string
  /** Grad-CAM overlay URL (signed storage URL preferred). */
  heatmap?: string | null
  /** Storage object path for heatmap (not a display URL). */
  heatmap_url?: string | null
  probabilities?: ClassProbabilities | null
  processing_time?: number | null
  model_version?: string | null
}

export type AnalysisHistoryInsert = {
  user_id: string
  prediction: string
  confidence: number
  image_url: string
  probabilities?: ClassProbabilities | null
  heatmap?: string | null
  heatmap_url?: string | null
  processing_time?: number | null
  model_version?: string | null
}

/** Resolve display heatmap from either column. */
export function resolveHeatmap(analysis: Pick<HistoryAnalysis, "heatmap" | "heatmap_url">): string | null {
  // heatmap holds display URL; heatmap_url may be a storage path
  if (analysis.heatmap?.startsWith("http") || analysis.heatmap?.startsWith("data:")) {
    return analysis.heatmap
  }
  if (analysis.heatmap_url?.startsWith("http") || analysis.heatmap_url?.startsWith("data:")) {
    return analysis.heatmap_url
  }
  return analysis.heatmap ?? null
}
