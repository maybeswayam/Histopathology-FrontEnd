"use client"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-panel border border-subtle bg-panel p-8 text-center panel-shadow sm:p-10">
          <div
            className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            aria-hidden
          />
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-benign-muted sm:h-20 sm:w-20">
              <CheckCircle className="h-8 w-8 text-benign sm:h-10 sm:w-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Account created
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your HistoAI workspace is almost ready.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-subtle bg-muted/80 p-4 text-left">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Verify your email</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  We&apos;ve sent a confirmation link. Check your inbox and verify to unlock
                  your workspace.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button asChild className="w-full rounded-lg">
              <Link href="/auth/login">
                Go to sign in
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-lg bg-transparent">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Research and educational use only. Not for clinical diagnosis.
        </p>
      </div>
    </AuthShell>
  )
}
