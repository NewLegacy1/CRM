import { createClient } from '@/lib/supabase/server'
import { Sparkles } from 'lucide-react'

export default async function InsightsPage() {
  const supabase = await createClient()
  
  const { data: insights } = await supabase
    .from('ai_insights')
    .select('*')
    .order('date', { ascending: false })
    .limit(7)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-amber-500" />
        <h1 className="text-2xl font-bold text-zinc-100">AI Insights</h1>
      </div>

      {insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-100">
                  {new Date(insight.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <p className="text-zinc-300 whitespace-pre-wrap">{insight.summary}</p>
              {insight.actionable_items && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-sm font-medium text-amber-500 mb-2">
                    Actionable Items:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                    {(insight.actionable_items as string[]).map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <Sparkles className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">No AI insights yet.</p>
          <p className="text-sm text-zinc-500">
            Daily insights will be generated automatically at 8am. You can also trigger them manually via API.
          </p>
        </div>
      )}
    </div>
  )
}
