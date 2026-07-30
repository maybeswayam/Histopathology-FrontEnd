"use client"

const DISCLAIMER_TEXT =
  "Not a medical diagnosis. For research and education only. Consult a qualified pathologist."

interface ResearchDisclaimerProps {
  className?: string
  /** Slightly denser copy for result cards */
  variant?: "banner" | "compact"
}

export function ResearchDisclaimer({
  className = "",
  variant = "banner",
}: ResearchDisclaimerProps) {
  if (variant === "compact") {
    return (
      <aside
        role="note"
        className={`rounded-lg border border-subtle bg-muted/70 px-4 py-3 text-left text-xs leading-5 text-muted-foreground ${className}`}
      >
        Research and educational use only. This is a <strong className="font-medium text-foreground">model suggestion</strong>, not a
        medical diagnosis. Grad-CAM shows model attention, not definitive evidence of disease.
      </aside>
    )
  }

  return (
    <aside
      role="note"
      aria-label="Intended use disclaimer"
      className={`border-b border-subtle bg-muted/80 px-4 py-2.5 text-center text-xs leading-5 text-muted-foreground sm:text-sm ${className}`}
    >
      {DISCLAIMER_TEXT}
    </aside>
  )
}

export const INTENDED_USE_SUMMARY = DISCLAIMER_TEXT
