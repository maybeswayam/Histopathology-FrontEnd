"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { AuthShell, AuthCard, AuthField } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle, ArrowRight, Lock, LogIn, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <AuthCard
        icon={LogIn}
        title="Welcome back"
        description="Sign in to your research workspace to review cases and run new analyses."
        footer={
          <>
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                Get started
              </Link>
            </p>
            <p className="hidden text-xs text-muted-foreground lg:block">
              <Link href="/guide" className="underline-offset-4 hover:underline">
                New here? Read the guide
              </Link>
            </p>
          </>
        }
      >
        <form onSubmit={handleLogin} className="space-y-5">
          <AuthField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <AuthField
            id="password"
            label="Password"
            icon={Lock}
            isPassword
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="group h-11 w-full rounded-lg font-medium shadow-[0_14px_32px_-18px_oklch(0.45_0.12_142_/_0.6)] transition-all hover:shadow-[0_18px_40px_-18px_oklch(0.45_0.12_142_/_0.7)]"
            disabled={isLoading}
          >
            {isLoading ? (
              "Signing in…"
            ) : (
              <>
                Sign in
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </>
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
