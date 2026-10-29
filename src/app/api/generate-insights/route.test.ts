import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const upsert = vi.fn()

// Chainable stand-in for supabase-js queries: every builder method returns itself,
// and awaiting it resolves to an empty result.
function queryBuilder() {
  const builder: Record<string, unknown> = {}
  for (const method of ['select', 'limit', 'eq', 'order']) builder[method] = () => builder
  builder.then = (resolve: (value: unknown) => unknown) =>
    Promise.resolve({ data: [], count: 0, error: null }).then(resolve)
  return builder
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => (table === 'ai_insights' ? { upsert } : queryBuilder()),
  }),
}))

const { GET, POST } = await import('./route')

const SECRET = 'test-secret'
const url = 'http://localhost/api/generate-insights'
const withAuth = (method: string, value = `Bearer ${SECRET}`) =>
  new Request(url, { method, headers: { authorization: value } })

function mockOpenAI(response: { ok: boolean; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    json: async () => response.body,
    text: async () => JSON.stringify(response.body),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const insight = { summary: 'All good', actionable_items: ['Call leads'] }

beforeEach(() => {
  vi.stubEnv('CRON_SECRET', SECRET)
  vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
  upsert.mockReset().mockResolvedValue({ error: null })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe.each([
  ['GET', GET],
  ['POST', POST],
])('%s /api/generate-insights', (method, handler) => {
  it('returns 500 and calls nothing when CRON_SECRET is not set', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const fetchMock = mockOpenAI({ ok: true, body: {} })

    const response = await handler(withAuth(method, 'Bearer '))

    expect(response.status).toBe(500)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 401 without an authorization header', async () => {
    const fetchMock = mockOpenAI({ ok: true, body: {} })

    const response = await handler(new Request(url, { method }))

    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 401 with the wrong secret', async () => {
    const fetchMock = mockOpenAI({ ok: true, body: {} })

    const response = await handler(withAuth(method, 'Bearer wrong-secret'))

    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('generates and saves insights with the correct secret', async () => {
    const fetchMock = mockOpenAI({
      ok: true,
      body: { choices: [{ message: { content: JSON.stringify(insight) } }] },
    })

    const response = await handler(withAuth(method))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, insight })
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(sent.messages.map((m: { role: string }) => m.role)).toEqual(['system', 'user'])
    expect(sent.messages[1].content).toContain("Today's full CRM data")
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining(insight))
  })

  it('returns 502 when OpenAI fails', async () => {
    mockOpenAI({ ok: false, body: { error: 'down' } })

    const response = await handler(withAuth(method))

    expect(response.status).toBe(502)
    expect(upsert).not.toHaveBeenCalled()
  })
})
