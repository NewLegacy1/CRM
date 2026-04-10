# Vercel Deployment Setup Guide

## Fixing the 404 Error

The 404 error you're seeing is likely due to missing environment variables in Vercel. Follow these steps to fix it:

## Step 1: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your CRM project
3. Go to **Settings** → **Environment Variables**
4. Add the following environment variables:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Optional Variables (for full functionality):

```
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
CALENDLY_API_TOKEN=your-calendly-api-token
```

**Note:** For production, update the webhook URLs:
```
N8N_NO_ANSWER_WEBHOOK_URL=https://your-n8n-instance.com/webhook/noansweremail
N8N_MEETING_BOOKED_WEBHOOK_URL=https://your-n8n-instance.com/webhook/meetingbooked
```

## Step 2: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

## Step 3: Verify Deployment

1. Wait for the deployment to complete
2. Visit your Vercel URL
3. You should see the login page instead of a 404 error

## Troubleshooting

### Still seeing 404?

1. **Check Build Logs**: Go to your deployment → **Build Logs** to see if there are any build errors
2. **Check Runtime Logs**: Go to **Functions** → **View Function Logs** to see runtime errors
3. **Verify Environment Variables**: Make sure all variables are set for **Production**, **Preview**, and **Development** environments (or at least Production)

### Common Issues:

- **Missing NEXT_PUBLIC_ prefix**: Variables that start with `NEXT_PUBLIC_` are exposed to the browser. Make sure they're set correctly.
- **Build fails**: Check that all required dependencies are in `package.json`
- **Runtime errors**: Check the function logs for specific error messages

## Security Note

⚠️ **Important**: The environment variables shown above are from your local `.env` file. Make sure these are the correct values for your production Supabase instance. Never commit `.env` files to git (they're already in `.gitignore`).
