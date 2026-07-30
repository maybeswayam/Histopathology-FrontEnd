export const AUTH_BYPASS =
  process.env.NEXT_PUBLIC_AUTH_BYPASS === "true"

export const DEV_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "dev@localhost",
  user_metadata: {
    full_name: "Local Dev",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
}

/** Fluent no-op query builder so pages can run without a real Supabase project. */
export function createBypassSupabaseClient() {
  const emptyResult = { data: [] as unknown[], error: null }
  const nullResult = { data: null, error: null }

  const builder: Record<string, unknown> = {}
  const chain = () => builder

  builder.select = chain
  builder.insert = async () => nullResult
  builder.update = chain
  builder.delete = chain
  builder.upsert = async () => nullResult
  builder.eq = chain
  builder.neq = chain
  builder.order = async () => emptyResult
  builder.limit = async () => emptyResult
  builder.single = async () => nullResult
  builder.maybeSingle = async () => nullResult
  builder.then = (resolve: (value: typeof emptyResult) => unknown) =>
    Promise.resolve(emptyResult).then(resolve)

  return {
    auth: {
      getUser: async () => ({ data: { user: DEV_USER }, error: null }),
      getSession: async () => ({
        data: { session: { user: DEV_USER, access_token: "bypass" } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        data: { user: DEV_USER, session: { user: DEV_USER } },
        error: null,
      }),
      signUp: async () => ({
        data: { user: DEV_USER, session: { user: DEV_USER } },
        error: null,
      }),
    },
    from: (_table: string) => builder,
  }
}
