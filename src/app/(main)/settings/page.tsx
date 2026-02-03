export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Calendly Integration</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Calendly events are displayed on the Meetings page. Configure <code className="text-amber-500">CALENDLY_API_TOKEN</code> in environment variables.
        </p>
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Integrations</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-zinc-300">n8n Webhooks</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Configured in environment variables:
            </p>
            <ul className="text-sm text-zinc-400 mt-2 space-y-1">
              <li>• No Answer SMS: <code className="text-amber-500">N8N_NO_ANSWER_WEBHOOK_URL</code></li>
              <li>• Meeting Booked: <code className="text-amber-500">N8N_MEETING_BOOKED_WEBHOOK_URL</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-zinc-300">OpenAI</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Daily AI insights powered by OpenAI GPT-4. Configure <code className="text-amber-500">OPENAI_API_KEY</code> in environment variables.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Database</h2>
        <p className="text-sm text-zinc-400">
          Supabase PostgreSQL with Row Level Security. Manage in the Supabase Dashboard.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Cron Jobs</h2>
        <p className="text-sm text-zinc-400">
          AI insights are generated daily at 8am via Vercel Cron. Manually trigger at <code className="text-amber-500">POST /api/generate-insights</code>.
        </p>
      </div>
    </div>
  )
}
