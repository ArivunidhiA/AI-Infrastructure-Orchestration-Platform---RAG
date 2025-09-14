# 🚀 Free Deployment Guide

This guide shows how to deploy the AI Infrastructure Platform **completely free** and **forever** using GitHub Pages + Vercel.

## 📋 Prerequisites

- GitHub account (free)
- Vercel account (free)
- Your code pushed to GitHub

## 🎯 Deployment Strategy

- **Frontend**: GitHub Pages (free forever)
- **Backend**: Vercel (free forever, 100GB bandwidth/month)
- **Database**: SQLite (file-based, no external database needed)

## 🖥️ Step 1: Deploy Frontend to GitHub Pages

### 1.1 Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### 1.2 Push the workflow file
The `.github/workflows/deploy.yml` file is already created. Just push it:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

### 1.3 Access your frontend
- Your frontend will be available at: `https://yourusername.github.io/AI-Infrastructure-Orchestration-Platform---RAG`
- It will automatically update on every push to main branch

## ⚙️ Step 2: Deploy Backend to Vercel

### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Deploy backend
```bash
cd backend
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **What's your project's name?** → ai-infra-backend
- **In which directory is your code located?** → ./

### 2.3 Get your backend URL
After deployment, Vercel will give you a URL like:
`https://ai-infra-backend-xxxxx.vercel.app`

## 🔗 Step 3: Connect Frontend to Backend

### 3.1 Update environment variables
In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `REACT_APP_API_URL`
4. Value: `https://your-vercel-backend-url.vercel.app`

### 3.2 Update the workflow
The workflow will automatically use this environment variable.

## 🎉 Step 4: Test Your Deployment

1. **Frontend**: Visit your GitHub Pages URL
2. **Backend**: Test API at `https://your-backend-url.vercel.app/api/docs`
3. **Full App**: Everything should work together!

## 💰 Cost Breakdown

- **GitHub Pages**: $0 (free forever)
- **Vercel**: $0 (free tier: 100GB bandwidth/month)
- **Total**: $0/month forever!

## 🔧 Troubleshooting

### Frontend not loading
- Check GitHub Actions tab for build errors
- Ensure `REACT_APP_API_URL` secret is set correctly

### Backend API errors
- Check Vercel function logs
- Ensure all dependencies are in requirements.txt

### CORS issues
- Backend already has CORS configured for all origins

## 📈 Scaling

If you need more resources later:
- **Vercel Pro**: $20/month for more bandwidth
- **GitHub Pages**: Still free
- **Database**: Can upgrade to PostgreSQL on Vercel

## 🎯 Alternative Free Options

If Vercel doesn't work for you:

1. **Render** (750 hours/month free)
2. **Railway** ($5 credit monthly)
3. **PythonAnywhere** (free tier with limitations)

## ✅ Success!

Your AI Infrastructure Platform is now live and free forever! 🚀
