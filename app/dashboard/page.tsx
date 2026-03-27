"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  Bot,
  Clock3,
  LogOut,
  Microscope,
  Percent,
  Plus,
  ScanSearch,
  ShieldCheck,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/StatCard"
import {
  HistoryCard,
  type HistoryAnalysis,
} from "@/components/HistoryCard"
import { HistoryDetailModal } from "@/components/HistoryDetailModal"
import { GeminiChat } from "@/components/GeminiChat"

interface DashboardStats {
  total: number
  cancerous: number
  benign: number
  avgConfidence: number
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<HistoryAnalysis[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    cancerous: 0,
    benign: 0,
    avgConfidence: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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

      const { data: historyData } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })

      const normalizedHistory = (historyData ?? []) as HistoryAnalysis[]
      setHistory(normalizedHistory)
      calculateStats(normalizedHistory)
      setIsLoading(false)
    }

    void fetchData()
  }, [router])

  const calculateStats = (data: HistoryAnalysis[]) => {
    const total = data.length
    const cancerous = data.filter((item) => item.prediction === "malignant").length
    const benign = total - cancerous
    const avgConfidence =
      total > 0 ? data.reduce((acc, item) => acc + item.confidence, 0) / total : 0

    setStats({ total, cancerous, benign, avgConfidence })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Researcher"

  const latestAnalysis = history[0] ?? null
  const analysesThisWeek = history.filter((item) => {
    const created = new Date(item.created_at).getTime()
    return created >= Date.now() - 7 * 24 * 60 * 60 * 1000
  }).length

  const latestAnalysisDate = latestAnalysis
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(latestAnalysis.created_at))
    : "No scans yet"

  const malignantRate = stats.total > 0 ? (stats.cancerous / stats.total) * 100 : 0

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7fcf9_0%,#eefbf3_100%)] px-6">
        <div className="rounded-3xl border border-emerald-100 bg-white px-8 py-10 text-center shadow-[0_22px_70px_-42px_rgba(22,101,52,0.35)]">
          <div className="mx-auto flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-emerald-100 border-t-emerald-600">
            <Microscope className="h-5 w-5 text-emerald-700" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-slate-950">
            Loading dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pulling your saved analyses and workspace summary.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fdf9_0%,#eefaf2_52%,#f8fcf9_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_14px_32px_-18px_rgba(22,101,52,0.5)]">
              <Microscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700/80">
                HistoAI
              </p>
              <h1 className="text-lg font-semibold text-slate-950">Dashboard</h1>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              className="rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700"
            >
              <Link href="/analyze">
                <Plus className="mr-1 h-4 w-4" />
                New Analysis
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid items-start gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="self-start h-fit rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(22,101,52,0.25)] sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px] xl:items-start">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
                  Workspace
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back, {displayName}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
                  Review recent histopathology analyses, inspect saved case details,
                  and launch a new prediction from one compact workspace.
                </p>

              </div>

              <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/75">
                  Next step
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Jump back into a saved case or start a fresh scan.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Button
                    asChild
                    className="rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                  >
                    <Link href="/analyze">
                      <ScanSearch className="mr-2 h-4 w-4" />
                      Start analysis
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-emerald-200 bg-white px-5 text-emerald-800 hover:bg-emerald-100/80"
                  >
                    <Link href="#history-panel">Open history</Link>
                  </Button>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                    <Clock3 className="h-3.5 w-3.5" />
                    Last activity
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {latestAnalysis ? latestAnalysis.prediction : "No saved cases yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{latestAnalysisDate}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50/70 px-5 py-4 ring-1 ring-emerald-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                  Latest case
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {latestAnalysis ? latestAnalysis.prediction : "No cases yet"}
                </p>
                <p className="mt-1 text-sm text-slate-500">{latestAnalysisDate}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50/70 px-5 py-4 ring-1 ring-emerald-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                  Weekly activity
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {analysesThisWeek} {analysesThisWeek === 1 ? "analysis" : "analyses"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Saved during the last 7 days
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50/70 px-5 py-4 ring-1 ring-emerald-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                  Malignant rate
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {malignantRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Of saved analysis history
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-200 bg-[linear-gradient(135deg,#166534_0%,#15803d_58%,#16a34a_100%)] p-6 text-white shadow-[0_22px_80px_-44px_rgba(22,101,52,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                  Snapshot
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Current account</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Clock3 className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
                <p className="text-sm text-emerald-50/75">Signed in as</p>
                <p className="mt-2 break-all text-base font-medium">{user?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
                  <p className="text-sm text-emerald-50/75">Saved cases</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.total}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
                  <p className="text-sm text-emerald-50/75">Assistant</p>
                  <p className="mt-2 text-2xl font-semibold">Ready</p>
                </div>
              </div>

              {latestAnalysis ? (
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-sm text-emerald-50/75">Latest scan</p>
                  <div className="mt-3 overflow-hidden rounded-2xl">
                    <img
                      src={latestAnalysis.image_url}
                      alt="Latest case preview"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Analyses"
            value={stats.total}
            icon={Activity}
            tone="emerald"
            meter={stats.total === 0 ? 0 : Math.min(100, stats.total * 12)}
            description="Saved histopathology records available in your workspace."
            detail={`${stats.total} archived case${stats.total === 1 ? "" : "s"}.`}
          />
          <StatCard
            title="Malignant Cases"
            value={stats.cancerous}
            icon={AlertTriangle}
            tone="rose"
            meter={malignantRate}
            description="Cases classified as malignant in your saved history."
            detail={`${malignantRate.toFixed(1)}% of saved records.`}
          />
          <StatCard
            title="Benign Cases"
            value={stats.benign}
            icon={ShieldCheck}
            tone="sky"
            meter={stats.total === 0 ? 0 : (stats.benign / stats.total) * 100}
            description="Cases classified as benign in your saved history."
            detail={`${stats.benign} benign case${stats.benign === 1 ? "" : "s"}.`}
          />
          <StatCard
            title="Avg. Confidence"
            value={`${(stats.avgConfidence * 100).toFixed(1)}%`}
            icon={Percent}
            tone="amber"
            meter={stats.avgConfidence * 100}
            description="Average model confidence across all recorded analyses."
            detail="Useful as a quick reliability snapshot."
          />
        </section>

        <section id="history-panel" className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(22,101,52,0.2)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
                  History
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Recent analyses
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Open any saved case to compare the original image with its recorded heatmap and prediction details.
                </p>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {history.length} total record{history.length === 1 ? "" : "s"}
              </p>
            </div>

            {history.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-14 text-center">
                <Microscope className="mx-auto h-10 w-10 text-emerald-500" />
                <h4 className="mt-4 text-xl font-semibold text-slate-950">
                  No analysis history yet
                </h4>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Your saved cases will appear here after the first scan.
                </p>
                <Button
                  asChild
                  className="mt-6 rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                >
                  <Link href="/analyze">Run first analysis</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-8 grid gap-4">
                {history.map((item) => (
                  <HistoryDetailModal key={item.id} analysis={item}>
                    <div className="cursor-pointer">
                      <HistoryCard analysis={item} />
                    </div>
                  </HistoryDetailModal>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <GeminiChat />

            <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(22,101,52,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                    Notes
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Quick workspace summary
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                  <Bot className="h-4 w-4 text-emerald-700" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-emerald-50/60 px-4 py-4 ring-1 ring-emerald-100">
                  <p className="text-sm font-medium text-slate-950">Confidence trend</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Average confidence across the current account is {(stats.avgConfidence * 100).toFixed(1)}%.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50/60 px-4 py-4 ring-1 ring-emerald-100">
                  <p className="text-sm font-medium text-slate-950">Latest recorded result</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {latestAnalysis
                      ? `${latestAnalysis.prediction} at ${Math.round(latestAnalysis.confidence * 100)}% confidence.`
                      : "No saved result yet."}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50/60 px-4 py-4 ring-1 ring-emerald-100">
                  <p className="text-sm font-medium text-slate-950">Recent activity</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {analysesThisWeek} saved {analysesThisWeek === 1 ? "analysis" : "analyses"} in the last 7 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
