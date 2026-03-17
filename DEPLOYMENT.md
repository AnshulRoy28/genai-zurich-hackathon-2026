# Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Select "yes" to link to existing project or create new
   - Project will be deployed!

4. **Add Environment Variables:**
   ```bash
   vercel env add VITE_MAPTILER_KEY
   vercel env add VITE_AWS_REGION
   vercel env add VITE_AWS_ACCESS_KEY_ID
   vercel env add VITE_AWS_SECRET_ACCESS_KEY
   vercel env add VITE_AWS_POLLY_VOICE_ID
   vercel env add VITE_AWS_POLLY_ENGINE
   ```
   - Paste values from your `.env` file when prompted
   - Select "Production" environment

5. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

6. **Get your shareable link:**
   - Link will be displayed in terminal
   - Format: `https://your-project-name.vercel.app`

---

### Option 2: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub:**
   ```bash
   # Create a new repository on GitHub first
   git remote add origin https://github.com/YOUR_USERNAME/emergency-response-sim.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to Vercel:**
   - Visit https://vercel.com/
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   VITE_MAPTILER_KEY = your_maptiler_key
   VITE_AWS_REGION = us-east-1
   VITE_AWS_ACCESS_KEY_ID = your_aws_key
   VITE_AWS_SECRET_ACCESS_KEY = your_aws_secret
   VITE_AWS_POLLY_VOICE_ID = Joanna
   VITE_AWS_POLLY_ENGINE = neural
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your shareable link!

---

## Alternative: Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Add Environment Variables:**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add all `VITE_*` variables

---

## Testing Your Deployment

Once deployed, test your app:

1. **Check Map Loads:**
   - Should see 3D map of Zurich
   - Should see blue responder markers

2. **Test Emergency:**
   - Press Ctrl+Space on map
   - Select patient from dropdown
   - Click "Start Emergency"
   - Should see responders moving
   - Should hear TTS audio briefing

3. **Check Console:**
   - Open browser DevTools (F12)
   - Look for any errors
   - Verify API calls are working

---

## Troubleshooting

### Map Not Loading
- Check `VITE_MAPTILER_KEY` is set correctly
- Verify key is valid at https://cloud.maptiler.com/

### TTS Not Working
- Check all `VITE_AWS_*` variables are set
- Verify AWS credentials are valid
- Check browser console for specific errors
- Ensure AWS Polly is enabled in your AWS account

### Build Fails
- Check all dependencies are installed
- Verify TypeScript compiles: `npm run build` locally
- Check Vercel build logs for specific errors

---

## Sharing Your Link

Once deployed, share your link:
```
https://your-project-name.vercel.app
```

For custom domain:
- Go to Vercel dashboard
- Project settings → Domains
- Add custom domain

---

## Environment Variables Checklist

Before deploying, ensure you have:
- ✅ `VITE_MAPTILER_KEY` (from https://cloud.maptiler.com/)
- ✅ `VITE_AWS_REGION` (e.g., us-east-1)
- ✅ `VITE_AWS_ACCESS_KEY_ID` (from AWS IAM)
- ✅ `VITE_AWS_SECRET_ACCESS_KEY` (from AWS IAM)
- ✅ `VITE_AWS_POLLY_VOICE_ID` (e.g., Joanna)
- ✅ `VITE_AWS_POLLY_ENGINE` (e.g., neural)

---

## Quick Commands Reference

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm your-project-name
```
