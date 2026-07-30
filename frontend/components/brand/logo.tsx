import Link from "next/link"
import { Microscope } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeMap = {
  sm: {
    tile: "h-8 w-8 rounded-lg",
    icon: "h-4 w-4",
    wordmark: "text-base",
    gap: "gap-2",
  },
  md: {
    tile: "h-10 w-10 rounded-xl",
    icon: "h-5 w-5",
    wordmark: "text-lg",
    gap: "gap-2.5",
  },
  lg: {
    tile: "h-11 w-11 rounded-2xl",
    icon: "h-5 w-5",
    wordmark: "text-xl",
    gap: "gap-3",
  },
  hero: {
    tile: "h-14 w-14 rounded-2xl sm:h-16 sm:w-16",
    icon: "h-7 w-7 sm:h-8 sm:w-8",
    wordmark: "text-4xl sm:text-5xl md:text-6xl",
    gap: "gap-4",
  },
} as const

export type LogoSize = keyof typeof sizeMap

interface LogoProps {
  href?: string | null
  size?: LogoSize
  showWordmark?: boolean
  className?: string
  /** When true, wordmark uses display face and larger weight (marketing hero) */
  emphasize?: boolean
}

export function Logo({
  href = "/",
  size = "md",
  showWordmark = true,
  className,
  emphasize = false,
}: LogoProps) {
  const s = sizeMap[size]

  const content = (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-[0_14px_32px_-18px_oklch(0.45_0.12_142_/_0.5)]",
          s.tile,
        )}
      >
        <Microscope className={s.icon} aria-hidden />
      </div>
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            s.wordmark,
            (emphasize || size === "hero") && "font-display font-bold",
          )}
        >
          HistoAI
        </span>
      ) : null}
    </>
  )

  const classes = cn("inline-flex items-center", s.gap, className)

  if (href === null) {
    return (
      <div className={classes} aria-label="HistoAI">
        {content}
      </div>
    )
  }

  return (
    <Link href={href} className={classes} aria-label="HistoAI home">
      {content}
    </Link>
  )
}
