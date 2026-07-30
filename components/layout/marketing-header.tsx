"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { LayoutDashboard } from "lucide-react"
import type { Session } from "@supabase/supabase-js"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface MarketingHeaderProps {
  className?: string
  transparent?: boolean
}

export function MarketingHeader({
  className,
  transparent = false,
}: MarketingHeaderProps) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    void supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      if (mounted) setIsAuthed(!!data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setIsAuthed(!!session?.user)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full",
        transparent
          ? "bg-transparent backdrop-blur-sm"
          : "border-b border-subtle bg-panel/90 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo href="/" size="md" />

        <nav className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/nerds">Space for nerds</Link>
          </Button>
          {isAuthed ? (
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-lg">
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
