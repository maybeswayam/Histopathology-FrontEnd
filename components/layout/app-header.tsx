"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, LogOut, Plus, ScanSearch } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  title?: string
  showPrimaryAction?: boolean
  className?: string
}

export function AppHeader({
  title,
  showPrimaryAction = true,
  className,
}: AppHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAnalyze = pathname?.startsWith("/analyze")
  const isDashboard = pathname?.startsWith("/dashboard")

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-subtle bg-panel/90 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Logo href="/" size="lg" />
          {title ? (
            <div className="hidden min-w-0 border-l border-subtle pl-3 sm:block sm:pl-4">
              <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
            </div>
          ) : null}
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="App">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "hidden text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex",
              isDashboard && "bg-muted text-foreground",
            )}
          >
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          </Button>

          {!showPrimaryAction ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "hidden text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex",
                isAnalyze && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
              )}
            >
              <Link href="/analyze">
                <ScanSearch className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">Analyze</span>
              </Link>
            </Button>
          ) : null}

          {showPrimaryAction ? (
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/analyze">
                <Plus className="h-4 w-4" aria-hidden />
                <span>New analysis</span>
              </Link>
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
