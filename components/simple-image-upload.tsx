"use client"

import { RefreshCw, ShieldCheck, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { useState, useCallback } from "react"

interface SimpleImageUploadProps {
  onImageUpload: (file: File) => void
  isLoading: boolean
}

export function SimpleImageUpload({ onImageUpload, isLoading }: SimpleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)

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
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onImageUpload(e.dataTransfer.files[0])
      }
    },
    [onImageUpload]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0])
    }
  }

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        className={cn(
          "group relative flex min-h-[420px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[32px] border px-10 py-12 text-center transition-all duration-200",
          dragActive
            ? "border-emerald-400 bg-emerald-50 shadow-[0_24px_80px_-50px_rgba(22,101,52,0.35)]"
            : "border-dashed border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#f5fcf7_100%)] hover:border-emerald-300 hover:bg-emerald-50/70",
          isLoading && "cursor-not-allowed opacity-80"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="pointer-events-none absolute inset-6 rounded-[28px] border border-emerald-100/80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_72%)]" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-600 text-white shadow-[0_18px_40px_-24px_rgba(22,101,52,0.55)]">
          {isLoading ? (
            <RefreshCw className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>

        <div className="relative mt-6 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
            {isLoading ? "Analyzing upload" : "Upload"}
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {isLoading ? "Running slide analysis" : "Drop a slide image here"}
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            {isLoading
              ? "The backend is generating the prediction, confidence scores, and Grad-CAM output."
              : "Drag and drop a histopathology image or browse from your device to start a new run."}
          </p>
        </div>

        <div className="relative mt-7 inline-flex items-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-medium text-emerald-800 shadow-sm">
          {isLoading ? "Processing image" : "Choose image"}
        </div>

        <div className="relative mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
          <span>PNG or JPG</span>
          <span className="h-1 w-1 rounded-full bg-emerald-300" />
          <span>Up to 10MB</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Stored after analysis
          </span>
        </div>

        <input
          id="dropzone-file"
          type="file"
          className="absolute inset-0 h-full w-full opacity-0"
          onChange={handleChange}
          disabled={isLoading}
        />
      </label>
    </div>
  )
}
