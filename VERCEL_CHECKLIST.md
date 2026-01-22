# Vercel Deployment Checklist - Kisan Ka Shati

## Pre-Deployment Verification ✅

- [x] Code committed to GitHub
- [x] Build successful locally (`npm run vercel-build`)
- [x] No console errors in development
- [x] Environment variables prepared
- [x] MongoDB Atlas account created and configured
- [x] vercel.json configured for monorepo structure
- [x] .vercelignore created to optimize deployment size

---

## Build Outputs Verified

```
Frontend Build:
- main.3df4666f.js        245.65 kB (gzipped)
- 239.05d1037d.chunk.js   46.34 kB
- 455.ed88db63.chunk.js   43.29 kB
- 977.d35724d6.chunk.js   8.69 kB
- main.8db6c035.css       7.32 kB
- 453.926f0775.chunk.js   1.76 kB

Total: ~352 kB (production-optimized)
Status: ✅ Compilation successful
```

---

## Deployment Instructions

### Option 1: Dashboard Deployment (Easiest)

1. Go to https://vercel.com/new
2. Select "Import Project"
3. Connect GitHub repository
4. Use these settings:
   - **Project Name**: kisan-ka-shati
   - **Framework**: Other
   - **Root Directory**: . (current)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install`

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd "/home/sama/Kisan Ka Shati"
vercel
```

### Option 3: GitHub Integration (Recommended)

1. Push to GitHub: `git push origin main`
2. Go to https://vercel.com/new
3. Import from GitHub
4. Vercel auto-deploys on every push

---

## Environment Variables to Set

In Vercel Dashboard → Project Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kisan-ka-shati
JWT_SECRET=your-very-secure-random-string-min-32-characters
NODE_ENV=production
CORS_ORIGIN=https://kisan-ka-shati.vercel.app
PORT=3001
```

---

## Post-Deployment Tasks

### 1. Test Core Features
- [ ] User Registration & Login
- [ ] Crop Management (Create, Read, Update, Delete)
- [ ] Material Tracking
- [ ] Analytics Dashboard
- [ ] PDF Export
- [ ] Language Switching
- [ ] Responsive Design (Mobile/Tablet/Desktop)

### 2. Verify API Connectivity
- [ ] API routes responding
- [ ] Database queries working
- [ ] Authentication tokens valid
- [ ] File uploads to `/uploads`

### 3. Monitor Performance
- [ ] Check Vercel Analytics
- [ ] Monitor API response times
- [ ] Verify CDN caching
- [ ] Check error logs

---

## Important Notes

### File Uploads

**Current Setup**: Files upload to `/uploads` directory
**Issue**: Vercel doesn't persist file system between deployments

**Solutions for Production**:

1. **AWS S3** (Recommended)
   - Setup S3 bucket
   - Update upload middleware
   - Add AWS credentials to environment

2. **MongoDB GridFS**
   - Store files in MongoDB
   - Retrieve from database
   - No external service needed

3. **Supabase Storage**
   - PostgreSQL + Object Storage
   - Simple integration
   - Generous free tier

**For Now**: Use in-memory storage or configure S3/Supabase later

### Database

MongoDB Atlas free tier includes:
- 512 MB storage
- Always-on clusters
- Auto backups
- IP whitelisting

Upgrade as needed for production load.

---

## Domain Setup

Once deployment is stable:

1. Register domain (GoDaddy, Namecheap, etc.)
2. In Vercel Project → Settings → Domains
3. Add custom domain
4. Update DNS records:
   - Name: `@` or root
   - Type: `A`
   - Value: `76.76.19.165`

Or use CNAME:
   - Name: `www`
   - Type: `CNAME`
   - Value: `cname.vercel.com`

---

## Monitoring & Maintenance

### Daily Checks
- Application availability
- Database connectivity
- Error rate in logs

### Weekly Checks
- Performance metrics
- API response times
- User feedback

### Monthly Tasks
- Database backup verification
- Update dependencies
- Security audit

---

## Rollback Plan

If issues occur:

```bash
# View all deployments
vercel deployments

# Rollback to previous version
vercel rollback
```

Or in Dashboard:
1. Go to Deployments tab
2. Find last stable version
3. Click three dots → "Promote to Production"

---

## Performance Targets

- Page Load: < 2s
- API Response: < 500ms
- Mobile Score: > 90
- Desktop Score: > 95
- Lighthouse: Green across all metrics

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Project Repo**: [Your GitHub URL]
- **Issue Tracker**: [Your GitHub Issues]

---

## Deployment Completed ✅

**Date**: January 23, 2026
**Status**: Ready for deployment
**Next Step**: Deploy to Vercel via Dashboard or CLI

All systems ready! Deploy with confidence! 🚀
