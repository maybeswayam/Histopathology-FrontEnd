import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Delete the signed-in user's analysis history and storage objects.
 * Retention: research demo — users may wipe their workspace at any time.
 */
export async function deleteMyData(supabase: SupabaseClient, userId: string): Promise<void> {
  // Remove storage objects under user prefix (best-effort)
  for (const bucket of ['slides', 'heatmaps'] as const) {
    const { data: listed } = await supabase.storage.from(bucket).list(userId, { limit: 1000 })
    if (listed?.length) {
      const paths = listed.map((obj) => `${userId}/${obj.name}`)
      await supabase.storage.from(bucket).remove(paths)
    }
  }

  const { error: histError } = await supabase
    .from('analysis_history')
    .delete()
    .eq('user_id', userId)
  if (histError) {
    throw new Error(`Could not delete analysis history: ${histError.message}`)
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId)
  if (profileError) {
    // Non-fatal — history wipe is the critical path
  }
}
