# Troubleshooting 404 Errors on Vercel

## Common Causes

### 1. Missing Environment Variables
If Supabase environment variables are not set in Vercel, the app may fail to initialize and return a 404.

**Solution**: Ensure these are set in Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Build Configuration Issues
Check that:
- `package.json` has correct build script: `"build": "next build"`
- `next.config.ts` is valid
- No TypeScript errors (run `npm run build` locally)

### 3. Routing Issues
- Verify `src/app/page.tsx` exists and exports a default component
- Check that route groups `(auth)` and `(main)` are properly structured
- Ensure middleware isn't blocking all routes

### 4. Deployment Logs
Check Vercel deployment logs for:
- Build errors
- Runtime errors
- Missing dependencies

## Quick Checks

1. **Verify Build Locally**:
   ```bash
   npm run build
   npm run start
   ```

2. **Check Vercel Logs**:
   - Go to your deployment → "View Function Logs"
   - Look for errors or warnings

3. **Test Routes**:
   - Try accessing `/login` directly
   - Try accessing `/dashboard` directly
   - Check if root `/` redirects properly

## If Still Getting 404

1. **Check Vercel Project Settings**:
   - Framework Preset: Next.js
   - Root Directory: (leave empty or set to project root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Verify Git Repository Structure**:
   - Files should be at root, not nested in subdirectories
   - `package.json` should be at root level

3. **Check Deployment URL**:
   - Make sure you're using the correct Vercel deployment URL
   - Try the preview URL vs production URL
