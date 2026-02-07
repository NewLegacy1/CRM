import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not configured' },
      { status: 500 }
    )
  }

  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Gather data from every page for full rundown
    const [
      { count: clientsCount },
      { data: projects },
      { data: deals },
      { data: leads },
      { data: meetings },
      { data: ads },
      { data: callLogs },
      { data: agencyAds },
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('id, name, status, type, progress').limit(50),
      supabase.from('deals').select('id, value, stage, meeting_id').limit(100),
      supabase.from('leads').select('id, status').limit(500),
      supabase.from('meetings').select('id, scheduled_at, source').limit(100),
      supabase.from('ads').select('spend, revenue, platform').limit(100),
      supabase.from('call_logs').select('id, outcome, created_at').limit(500),
      supabase.from('agency_ads').select('platform, spend, impressions, clicks').limit(100),
    ])

    const totalSpend = ads?.reduce((sum: number, ad: { spend?: number }) => sum + (ad.spend || 0), 0) || 0
    const totalRevenue = ads?.reduce((sum: number, ad: { revenue?: number }) => sum + (ad.revenue || 0), 0) || 0
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00'
    const closedWonDeals = deals?.filter((d: { stage: string }) => d.stage === 'closed_won').length || 0
    const aov = closedWonDeals > 0 ? (totalRevenue / closedWonDeals).toFixed(2) : '0.00'
    const dealsFromMeetings = deals?.filter((d: { meeting_id?: string }) => d.meeting_id).length || 0
    const leadsByStatus = {
      new: leads?.filter((l: { status: string }) => l.status === 'new').length || 0,
      booked: leads?.filter((l: { status: string }) => l.status === 'booked').length || 0,
      no_answer: leads?.filter((l: { status: string }) => l.status === 'no_answer').length || 0,
      didnt_book: leads?.filter((l: { status: string }) => l.status === 'didnt_book').length || 0,
    }
    const upcomingMeetings = meetings?.filter((m: { scheduled_at: string }) => new Date(m.scheduled_at) > new Date()).length || 0
    const callOutcomes = {
      no_answer: callLogs?.filter((c: { outcome: string }) => c.outcome === 'no_answer').length || 0,
      didnt_book: callLogs?.filter((c: { outcome: string }) => c.outcome === 'didnt_book').length || 0,
      booked: callLogs?.filter((c: { outcome: string }) => c.outcome === 'booked').length || 0,
    }
    const agencySpend = agencyAds?.reduce((sum: number, a: { spend?: number }) => sum + (a.spend || 0), 0) || 0
    const activeProjects = projects?.filter((p: { status: string }) => p.status === 'active').length || 0

    const dataBlob = {
      clients: { total: clientsCount ?? 0 },
      projects: { total: projects?.length ?? 0, active: activeProjects },
      deals: { total: deals?.length ?? 0, closedWon: closedWonDeals, fromColdCall: dealsFromMeetings },
      leads: { total: leads?.length ?? 0, byStatus: leadsByStatus },
      meetings: { total: meetings?.length ?? 0, upcoming: upcomingMeetings },
      clientAds: { totalSpend, totalRevenue, roas, aov },
      coldCalling: { callOutcomes },
      ourAgencyAds: { totalSpend: agencySpend, campaigns: agencyAds?.length ?? 0 },
    }

    const systemPrompt = `You are an expert agency operations analyst. Your job is to produce a daily executive rundown and analytics summary for a web-creation agency CRM. Use the provided JSON data from every area of the business (clients, projects, deals, leads, meetings, client ads, cold calling, and our own agency ads). Be concise, use numbers, and give 3–5 actionable recommendations. Focus on: pipeline health, cold-call conversion, ad performance, and what to prioritize today. Output only valid JSON.`

    const userPrompt = `Today's full CRM data (use this for the rundown and analytics):

\`\`\`json
${JSON.stringify(dataBlob, null, 2)}
\`\`\`

Provide:
1. A 2–4 sentence executive summary (overall health and highlights).
2. A "Rundown" section: bullet points for Clients, Projects, Deals, Leads, Meetings, Ads, Cold Calling.
3. "Actionable items": array of 3–5 specific next steps (prioritized).

Format your response as JSON only:
{
  "summary": "...",
  "actionable_items": ["...", "...", "..."]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('OpenAI error:', text)
      return NextResponse.json(
        { error: 'OpenAI API failed' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      )
    }

    let parsed: { summary?: string; actionable_items?: string[] }
    try {
      parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim()) : content
    } catch {
      parsed = { summary: content, actionable_items: [] }
    }

    // Save to database
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('ai_insights').upsert({
      date: today,
      summary: parsed.summary,
      actionable_items: parsed.actionable_items,
    })

    return NextResponse.json({ ok: true, insight: parsed })
  } catch (err) {
    console.error('generate-insights error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
