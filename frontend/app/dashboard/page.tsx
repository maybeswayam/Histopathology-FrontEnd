"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Microscope, ScanSearch, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HistoryCard } from "@/components/HistoryCard"
import type { HistoryAnalysis } from "@/types/analysis"
import { HistoryDetailModal } from "@/components/HistoryDetailModal"
import { AppHeader } from "@/components/layout/app-header"
import { Logo } from "@/components/brand/logo"
import { ResearchDisclaimer } from "@/components/research-disclaimer"
import { deleteMyData } from "@/lib/privacy"

const PAGE_SIZE = 20

export default function Dashboard() {
  const [user, setUser] = useState<{
    id: string
    email?: string
    user_metadata?: { full_name?: string }
  } | null>(null)
  const [history, setHistory] = useState<HistoryAnalysis[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const loadHistory = async (userId: string, offset = 0, append = false) => {
    const from = offset
    const to = offset + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from("analysis_history")
      .select(
        "id, created_at, prediction, confidence, image_url, heatmap, heatmap_url, probabilities, processing_time, model_version",
        { count: "exact" },
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      // Fallback if model_version column not yet migrated
      const fallback = await supabase
        .from("analysis_history")
        .select(
          "id, created_at, prediction, confidence, image_url, heatmap, heatmap_url, probabilities, processing_time",
          { count: "exact" },
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to)

      if (fallback.error) {
        setHistoryError(
          `${fallback.error.message}. If the table is missing, run frontend/scripts/setup_supabase.sql in Supabase.`,
        )
        return
      }
      setHistoryError(null)
      const rows = (fallback.data ?? []) as HistoryAnalysis[]
      setHistory((prev) => (append ? [...prev, ...rows] : rows))
      setTotalCount(fallback.count ?? rows.length)
      setHasMore((fallback.count ?? 0) > offset + rows.length)
      return
    }

    setHistoryError(null)
    const rows = (data ?? []) as HistoryAnalysis[]
    setHistory((prev) => (append ? [...prev, ...rows] : rows))
    setTotalCount(count ?? rows.length)
    setHasMore((count ?? 0) > offset + rows.length)
  }

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)
      await loadHistory(currentUser.id, 0, false)
      setIsLoading(false)
    }

    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [router])

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Researcher"

  const analysesThisWeek = history.filter((item) => {
    const created = new Date(item.created_at).getTime()
    return created >= Date.now() - 7 * 24 * 60 * 60 * 1000
  }).length

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-wash px-6">
        <div
          className="rounded-panel border border-subtle bg-panel px-8 py-10 text-center panel-shadow"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-primary/15 border-t-primary">
            <Microscope className="h-5 w-5 text-primary" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Loading dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pulling your saved analyses and workspace summary.
          </p>
        </div>
      </div>
    )
  }

  const isEmpty = totalCount === 0 && history.length === 0

  return (
    <div className="min-h-screen bg-page-wash text-foreground">
      <AppHeader title="Dashboard" showPrimaryAction />
      <ResearchDisclaimer />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {historyError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Could not load history: {historyError}</AlertDescription>
          </Alert>
        )}

        {isEmpty ? (
          <section className="rounded-panel border border-subtle bg-panel px-6 py-14 text-center panel-shadow sm:px-10 sm:py-20">
            <div className="mx-auto flex max-w-lg flex-col items-center">
              <Logo href={null} size="lg" showWordmark={false} />
              <h2 className="font-display mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Run your first analysis
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Welcome, {displayName}. Upload a histopathology slide to get a research
                prediction and Grad-CAM attention map. Saved cases will appear here.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-lg px-7">
                <Link href="/analyze">
                  <ScanSearch className="h-4 w-4" aria-hidden />
                  Start analysis
                </Link>
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-panel border border-subtle bg-panel p-6 panel-shadow sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Welcome back, {displayName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                    {totalCount} saved {totalCount === 1 ? "case" : "cases"}
                    {analysesThisWeek > 0 ? ` · ${analysesThisWeek} this week` : null}
                  </p>
                </div>
                <Button asChild size="lg" className="rounded-lg shrink-0">
                  <Link href="/analyze">
                    <ScanSearch className="h-4 w-4" aria-hidden />
                    New analysis
                  </Link>
                </Button>
              </div>
            </section>

            <section
              id="history-panel"
              className="rounded-panel border border-subtle bg-panel p-6 panel-shadow sm:p-8"
              aria-labelledby="history-heading"
            >
              <div>
                <h3
                  id="history-heading"
                  className="font-display text-2xl font-semibold tracking-tight text-foreground"
                >
                  Recent analyses
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open a case to review the model suggestion and Grad-CAM.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {history.map((item) => (
                  <HistoryDetailModal key={item.id} analysis={item}>
                    <div className="cursor-pointer rounded-2xl transition hover:ring-1 hover:ring-primary/20">
                      <HistoryCard analysis={item} />
                    </div>
                  </HistoryDetailModal>
                ))}
              </div>

              {hasMore ? (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    disabled={isPending}
                    onClick={() => {
                      if (!user) return
                      startTransition(async () => {
                        await loadHistory(user.id, history.length, true)
                      })
                    }}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Loading…
                      </>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                </div>
              ) : null}
            </section>

            <section className="rounded-panel border border-subtle bg-panel p-5 panel-shadow">
              <h3 className="text-sm font-semibold text-foreground">Privacy</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Remove your saved analyses and uploaded slides from this workspace. See{" "}
                <Link href="/guide" className="underline underline-offset-2">
                  the guide
                </Link>{" "}
                and docs/PRIVACY.md for retention details.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg text-destructive hover:bg-destructive/5"
                disabled={isDeleting || !user}
                onClick={() => {
                  if (!user) return
                  const ok = window.confirm(
                    "Delete all of your HistoAI analyses and uploaded images? This cannot be undone.",
                  )
                  if (!ok) return
                  setIsDeleting(true)
                  void deleteMyData(supabase, user.id)
                    .then(() => {
                      setHistory([])
                      setTotalCount(0)
                      setHasMore(false)
                    })
                    .catch((err: unknown) => {
                      setHistoryError(err instanceof Error ? err.message : "Delete failed")
                    })
                    .finally(() => setIsDeleting(false))
                }}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                Delete my data
              </Button>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
