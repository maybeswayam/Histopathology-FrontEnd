"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Microscope, type LucideIcon } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * SVG-rendered histology slide motif — abstract tissue lobules with nuclei.
 * Tinted in the product's medical-green palette (hue 142 + lime accents).
 * Deterministic (no hydration risk).
 */
function HistologyArtwork() {
  return (
    <svg viewBox="0 0 640 640" className="h-full w-full" aria-hidden="true" role="presentation">
      <defs>
        <filter id="auth-histo-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* Tissue lobules — irregular cell clusters in sage/green tones */}
      <g filter="url(#auth-histo-blur)" opacity="0.8">
        <path
          d="M60 120 Q110 40 210 70 Q290 30 340 110 Q420 90 440 180 Q500 230 430 300 Q440 400 330 410 Q260 480 170 430 Q60 440 60 330 Q20 250 70 200 Z"
          fill="oklch(0.88 0.06 145 / 0.9)"
        />
        <path
          d="M380 60 Q480 30 540 110 Q610 130 590 230 Q620 320 530 360 Q500 450 400 430 Q330 470 300 380 Q250 320 300 240 Q270 150 360 120 Z"
          fill="oklch(0.91 0.05 120 / 0.85)"
        />
        <path
          d="M120 400 Q200 340 280 410 Q370 380 400 470 Q440 560 330 590 Q220 630 150 560 Q60 540 80 460 Z"
          fill="oklch(0.86 0.065 150 / 0.85)"
        />
        <path
          d="M420 400 Q520 370 570 460 Q630 520 560 590 Q480 630 410 580 Q350 540 380 470 Z"
          fill="oklch(0.9 0.055 100 / 0.9)"
        />
      </g>

      {/* Nuclei — small deep-green dots scattered through tissue */}
      <g fill="oklch(0.45 0.1 148 / 0.5)">
        {[
          [120, 140], [180, 100], [240, 130], [300, 110], [150, 200], [210, 180], [270, 200],
          [90, 260], [150, 300], [240, 260], [320, 180], [370, 230], [420, 160], [480, 140],
          [520, 200], [460, 260], [540, 290], [400, 320], [330, 280], [280, 340], [200, 360],
          [140, 380], [110, 460], [180, 480], [250, 450], [320, 470], [260, 540], [180, 540],
          [340, 540], [420, 480], [470, 430], [530, 480], [560, 550], [490, 560], [430, 560],
          [370, 130], [430, 90], [500, 100], [560, 160], [90, 180], [60, 300],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={3 + (i % 4)} />
        ))}
      </g>
    </svg>
  )
}

/** Shared editorial copy block shown inside the showcase panel. */
const SHOWCASE_POINTS = [
  { title: "Explainable by design", body: "Every prediction ships with a Grad-CAM heatmap showing where the model looked." },
  { title: "Private by default", body: "Row-level security keeps your slides, results, and history visible only to you." },
  { title: "Research-grade honesty", body: "Model suggestions with confidence scores — never presented as diagnosis." },
] as const

interface AuthShowcasePanelProps {
  className?: string
}

/**
 * Left showcase panel for the split-screen auth layout.
 * Light clinical panel with an abstract histology motif — desktop only.
 */
export function AuthShowcasePanel({ className }: AuthShowcasePanelProps) {
  return (
    <aside
      className={cn(
        "relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-subtle bg-panel p-10 lg:flex xl:p-14",
        className,
      )}
    >
      {/* Atmosphere wash — green-dominant with a lime lift */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 60% at 20% 0%, oklch(0.9 0.05 142 / 0.6), transparent 55%), radial-gradient(ellipse 70% 55% at 100% 100%, oklch(0.9 0.05 85 / 0.45), transparent 60%)",
        }}
      />

      {/* Histology artwork, centered behind content */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-80">
        <div className="h-[34rem] w-[34rem] max-w-full xl:h-[38rem] xl:w-[38rem]">
          <HistologyArtwork />
        </div>
      </div>

      <div className="relative z-10">
        <Logo href="/" size="md" />
      </div>

      <div className="relative z-10 max-w-md space-y-8">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-subtle bg-panel/80 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur">
            <Microscope className="h-3.5 w-3.5 text-primary" aria-hidden />
            Research workspace
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground xl:text-5xl">
            See what the model sees.
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            Upload a histopathology slide, get a benign/malignant suggestion, and inspect the
            Grad-CAM heatmap behind every call.
          </p>
        </div>

        <ul className="space-y-4">
          {SHOWCASE_POINTS.map((point) => (
            <li key={point.title} className="flex gap-3">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{point.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs leading-relaxed text-muted-foreground">
        Research and educational use only. Not a medical device — model suggestions require
        review by a qualified pathologist.
      </p>
    </aside>
  )
}

interface AuthCardProps {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Refined form card for the right column of the auth split-screen.
 * Signature details: green hairline across the top, icon tile header.
 */
export function AuthCard({ icon: Icon, title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-panel border border-subtle bg-panel p-8 panel-shadow sm:p-10">
        {/* Hairline accent — fades in from the edges, product-green */}
        <div
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          aria-hidden
        />

        <div className="mb-8 space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-benign-muted">
            <Icon className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>

        {children}

        {footer ? (
          <div className="mt-8 space-y-4 border-t border-subtle pt-6 text-center text-sm">
            {footer}
          </div>
        ) : null}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        Research and educational use only. Not for clinical diagnosis.
      </p>
    </div>
  )
}

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: LucideIcon
  /** Enables show/hide toggle and forces type=password behavior */
  isPassword?: boolean
}

/**
 * Labeled input with a leading icon and optional password visibility toggle.
 * Shared by all auth forms for a consistent, refined field treatment.
 */
export function AuthField({ id, label, icon: Icon, isPassword, ...inputProps }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const type = isPassword ? (showPassword ? "text" : "password") : inputProps.type

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          {...inputProps}
          type={type}
          className={cn(
            "h-11 rounded-lg border-border bg-muted/40 pl-9 transition-colors focus-visible:bg-panel focus-visible:ring-primary/40",
            isPassword && "pr-11",
            inputProps.className,
          )}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </div>
  )
}

interface AuthShellProps {
  children: React.ReactNode
}

/**
 * Split-screen auth layout: showcase panel on the left (desktop),
 * form column on the right with a mobile-only compact header.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-page-wash">
      <AuthShowcasePanel />

      <main className="relative flex flex-1 flex-col">
        {/* Mobile-only compact header — panel carries branding on desktop */}
        <header className="border-b border-subtle bg-panel/80 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl px-4 py-4 sm:px-6">
            <Logo href="/" size="md" />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          {children}
        </div>

        <p className="pb-6 text-center text-xs text-muted-foreground lg:hidden">
          <Link href="/guide" className="underline-offset-4 hover:underline">
            New here? Read the guide
          </Link>
        </p>
      </main>
    </div>
  )
}
