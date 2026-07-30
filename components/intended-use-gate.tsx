"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { INTENDED_USE_SUMMARY } from "@/components/research-disclaimer"

type GateState =
  | { status: "loading" }
  | { status: "accepted" }
  | { status: "needs_acceptance" }
  | { status: "setup_error"; message: string }

interface IntendedUseGateProps {
  userId: string
  /** Called when acceptance is confirmed (already accepted or just accepted). */
  onAccepted: () => void
  children: React.ReactNode
}

/**
 * Blocks analysis UI until the user has accepted intended-use terms
 * persisted on user_profiles.intended_use_accepted_at.
 */
export function IntendedUseGate({ userId, onAccepted, children }: IntendedUseGateProps) {
  const supabase = useRef(createClient()).current
  const onAcceptedRef = useRef(onAccepted)
  onAcceptedRef.current = onAccepted

  const [gate, setGate] = useState<GateState>({ status: "loading" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadAcceptance = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("intended_use_accepted_at")
        .eq("user_id", userId)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        const msg = error.message || "Unknown database error"
        const looksLikeMissingTable =
          /user_profiles|schema cache|does not exist|relation/i.test(msg)
        setGate({
          status: "setup_error",
          message: looksLikeMissingTable
            ? `Database setup incomplete: run frontend/scripts/001_create_tables.sql and 002_align_analysis_history.sql in Supabase SQL editor. (${msg})`
            : `Could not verify intended-use acceptance: ${msg}`,
        })
        return
      }

      if (data?.intended_use_accepted_at) {
        setGate({ status: "accepted" })
        onAcceptedRef.current()
      } else {
        setGate({ status: "needs_acceptance" })
      }
    }

    void loadAcceptance()
    return () => {
      cancelled = true
    }
  }, [supabase, userId])

  const handleAccept = useCallback(async () => {
    setSaving(true)
    const now = new Date().toISOString()
    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        intended_use_accepted_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" },
    )
    setSaving(false)

    if (error) {
      setGate({
        status: "setup_error",
        message: `Failed to save acceptance: ${error.message}. Ensure user_profiles exists (run SQL migrations).`,
      })
      return
    }

    setGate({ status: "accepted" })
    onAcceptedRef.current()
  }, [supabase, userId])

  if (gate.status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-muted-foreground">
        Checking intended-use acknowledgment…
      </div>
    )
  }

  if (gate.status === "setup_error") {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{gate.message}</AlertDescription>
      </Alert>
    )
  }

  if (gate.status === "needs_acceptance") {
    return (
      <>
        <AlertDialog open>
          <AlertDialogContent className="sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Intended use — research only</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    HistoAI is a{" "}
                    <strong className="text-foreground">
                      research and educational prototype
                    </strong>
                    . It is not a medical device and must not be used as a clinical diagnosis.
                  </p>
                  <p>{INTENDED_USE_SUMMARY}</p>
                  <p>
                    Predictions are model suggestions from a CNN. Grad-CAM heatmaps show where
                    the model attended — they are not proof of disease. Always consult a
                    qualified pathologist for clinical decisions.
                  </p>
                  <p className="text-xs">
                    Full statement: see docs/INTENDED_USE.md in the repository.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                disabled={saving}
                onClick={(e) => {
                  e.preventDefault()
                  void handleAccept()
                }}
              >
                {saving ? "Saving…" : "I understand — continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="pointer-events-none select-none opacity-40 blur-[1px]" aria-hidden>
          {children}
        </div>
      </>
    )
  }

  return <>{children}</>
}
