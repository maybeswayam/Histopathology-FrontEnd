import type { SupabaseClient } from '@supabase/supabase-js'

const SLIDES_BUCKET = 'slides'
const HEATMAPS_BUCKET = 'heatmaps'

function extFromMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  return 'jpg'
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(',')
  const mimeMatch = /data:(.*?);base64/.exec(header)
  const mime = mimeMatch?.[1] || 'image/png'
  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

export interface StoredMediaPaths {
  image_url: string
  heatmap: string | null
  heatmap_url: string | null
  usedStorage: boolean
}

/**
 * Upload slide + Grad-CAM to Supabase Storage when buckets exist.
 * Falls back to data URLs if storage is unavailable (local/demo).
 */
export async function persistAnalysisMedia(
  supabase: SupabaseClient,
  opts: {
    userId: string
    analysisId: string
    imageFile: File
    heatmapDataUrl?: string | null
  },
): Promise<StoredMediaPaths> {
  const { userId, analysisId, imageFile, heatmapDataUrl } = opts
  const slideExt = extFromMime(imageFile.type || 'image/jpeg')
  const slidePath = `${userId}/${analysisId}.${slideExt}`
  const heatmapPath = `${userId}/${analysisId}.png`

  try {
    const slideUpload = await supabase.storage.from(SLIDES_BUCKET).upload(slidePath, imageFile, {
      contentType: imageFile.type || 'image/jpeg',
      upsert: true,
    })

    if (slideUpload.error) {
      throw slideUpload.error
    }

    const { data: slidePublic } = supabase.storage.from(SLIDES_BUCKET).getPublicUrl(slidePath)
    let heatmapPublicUrl: string | null = null

    if (heatmapDataUrl?.startsWith('data:')) {
      const blob = dataUrlToBlob(heatmapDataUrl)
      const heatUpload = await supabase.storage
        .from(HEATMAPS_BUCKET)
        .upload(heatmapPath, blob, {
          contentType: 'image/png',
          upsert: true,
        })
      if (!heatUpload.error) {
        const { data } = supabase.storage.from(HEATMAPS_BUCKET).getPublicUrl(heatmapPath)
        heatmapPublicUrl = data.publicUrl
      }
    }

    // Prefer signed URLs for private buckets
    const signedSlide = await supabase.storage
      .from(SLIDES_BUCKET)
      .createSignedUrl(slidePath, 60 * 60 * 24 * 7)
    const imageUrl = signedSlide.data?.signedUrl || slidePublic.publicUrl

    let heatmapUrl = heatmapPublicUrl
    if (heatmapPublicUrl || heatmapDataUrl) {
      const signedHeat = await supabase.storage
        .from(HEATMAPS_BUCKET)
        .createSignedUrl(heatmapPath, 60 * 60 * 24 * 7)
      if (signedHeat.data?.signedUrl) {
        heatmapUrl = signedHeat.data.signedUrl
      }
    }

    return {
      image_url: imageUrl,
      heatmap: heatmapUrl,
      heatmap_url: heatmapPath,
      usedStorage: true,
    }
  } catch {
    // Storage buckets may not exist yet — keep demo path working
    const dataUrl = await fileToDataUrl(imageFile)
    return {
      image_url: dataUrl,
      heatmap: heatmapDataUrl ?? null,
      heatmap_url: null,
      usedStorage: false,
    }
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}
