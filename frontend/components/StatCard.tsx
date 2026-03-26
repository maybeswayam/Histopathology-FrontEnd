"use client"

import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatTone = "emerald" | "rose" | "amber" | "sky"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description: string
  detail?: string
  tone?: StatTone
  meter?: number
}

const toneStyles: Record<
  StatTone,
  { glow: string; iconWrap: string; iconColor: string; bar: string }
> = {
  emerald: {
    glow: "bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_68%)]",
    iconWrap: "border-emerald-100 bg-emerald-50",
    iconColor: "text-emerald-700",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
  },
  rose: {
    glow: "bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.2),transparent_68%)]",
    iconWrap: "border-rose-100 bg-rose-50",
    iconColor: "text-rose-700",
    bar: "bg-gradient-to-r from-rose-500 to-orange-400",
  },
  amber: {
    glow: "bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_68%)]",
    iconWrap: "border-amber-100 bg-amber-50",
    iconColor: "text-amber-700",
    bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
  sky: {
    glow: "bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_68%)]",
    iconWrap: "border-sky-100 bg-sky-50",
    iconColor: "text-sky-700",
    bar: "bg-gradient-to-r from-sky-500 to-cyan-400",
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  detail,
  tone = "emerald",
  meter = 0,
}: StatCardProps) {
  const toneStyle = toneStyles[tone]
  const safeMeter = Math.max(0, Math.min(100, meter))

  return (
    <Card className="relative overflow-hidden border border-white/70 bg-white/80 p-6 shadow-[0_26px_90px_-56px_rgba(15,23,42,0.48)] backdrop-blur-xl">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-28", toneStyle.glow)} />

      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {title}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
          </div>

          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm",
              toneStyle.iconWrap
            )}
          >
            <Icon className={cn("h-5 w-5", toneStyle.iconColor)} />
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-600">{description}</p>

        <div className="space-y-2">
          <div className="h-2 rounded-full bg-slate-200/80">
            <div
              className={cn("h-2 rounded-full transition-all duration-500", toneStyle.bar)}
              style={{ width: `${safeMeter}%` }}
            />
          </div>
          {detail ? (
            <p className="text-xs font-medium text-slate-500">{detail}</p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
