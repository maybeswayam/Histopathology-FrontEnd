"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { AuthShell, AuthCard, AuthField } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle, ArrowRight, Lock, Mail, UserPlus } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <AuthCard
        icon={UserPlus}
        title="Create your workspace"
        description="One account for uploading slides, reviewing Grad-CAM explanations, and tracking your case history."
        footer={
          <>
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
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
        <form onSubmit={handleSignUp} className="space-y-5">
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <AuthField
            id="confirm-password"
            label="Confirm password"
            icon={Lock}
            isPassword
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              "Creating account…"
            ) : (
              <>
                Get started
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
