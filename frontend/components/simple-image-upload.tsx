"use client"

import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { useState, useCallback } from "react"
import { validateUploadFile } from "@/services/unified-api"

interface SimpleImageUploadProps {
  onImageUpload: (file: File) => void
  isLoading: boolean
  stageLabel?: string | null
  progress?: number
  disabled?: boolean
}

export function SimpleImageUpload({
  onImageUpload,
  isLoading,
  stageLabel,
  progress = 0,
  disabled = false,
}: SimpleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const blocked = isLoading || disabled

  const acceptFile = useCallback(
    (file: File) => {
      const err = validateUploadFile(file)
      if (err) {
        setLocalError(err)
        return
      }
      setLocalError(null)
      onImageUpload(file)
    },
    [onImageUpload],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (blocked) return
      if (e.dataTransfer.files?.[0]) {
        acceptFile(e.dataTransfer.files[0])
      }
    },
    [blocked, acceptFile],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (blocked) return
    if (e.target.files?.[0]) {
      acceptFile(e.target.files[0])
    }
  }

  if (isLoading) {
    return (
      <div
        className="flex min-h-[42vh] w-full flex-col items-center justify-center rounded-panel border border-subtle bg-panel px-6 py-14 panel-shadow"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-muted-foreground">Analysis in progress</p>
        <p className="font-display mt-3 text-xl font-semibold text-foreground">
          {stageLabel ?? "Working…"}
        </p>
        <div className="mt-8 h-2 w-full max-w-sm overflow-hidden rounded-full bg-primary/15">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{Math.round(progress)}%</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        className={cn(
          "relative flex min-h-[min(52vh,28rem)] w-full flex-col items-center justify-center rounded-panel border-2 border-dashed transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
          blocked ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          dragActive && !blocked
            ? "border-primary bg-primary/5"
            : "border-primary/25 bg-panel hover:border-primary/50 hover:bg-muted/40",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center sm:py-16">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Upload className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Drop a slide here, or click to browse
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            PNG, JPG, or WebP · Max 10&nbsp;MB · Histopathology images for research analysis
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={handleChange}
          disabled={blocked}
          aria-describedby={localError ? "upload-error" : undefined}
        />
      </label>
      {localError ? (
        <p id="upload-error" className="mt-3 text-sm text-destructive" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  )
}
