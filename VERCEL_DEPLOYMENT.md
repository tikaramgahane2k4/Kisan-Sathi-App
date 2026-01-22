# Vercel Deployment Guide

## Project: Kisan Ka Shati - Digital Farming Companion

This guide covers deploying the Kisan Ka Shati application to Vercel.

---

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push code to GitHub
3. **Environment Variables**: Prepare .env variables

---

## Deployment Steps

### Step 1: Prepare Environment Variables

Set up environment variables in Vercel Dashboard:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
CORS_ORIGIN=https://your-domain.vercel.app
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Import Project"
3. Paste your GitHub repository URL
4. Select your repository
5. Configure settings:
   - **Project Name**: `kisan-ka-shati`
   - **Framework**: `Other`
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.production`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-domain.vercel.app`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build completion (3-5 minutes)
3. Get your deployment URL

---

## Project Structure for Vercel

```
kisan-ka-shati/
├── vercel.json           # Vercel configuration
├── package.json          # Root package.json
├── server/
│   ├── server.js         # Express API server
│   ├── middleware/       # Auth, upload middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   ├── build/           # Generated on build
│   ├── package.json
│   └── tailwind.config.js
└── .vercelignore        # Files to ignore
```

---

## vercel.json Configuration

The `vercel.json` file configures:

1. **Frontend Build**: React build output to `client/build`
2. **Backend Server**: Node.js API on `/api` routes
3. **SPA Routing**: Redirects to `index.html` for client routes
4. **Static Files**: Serves uploads from `/uploads`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "client/build" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/server.js" },
    { "src": "/uploads/(.*)", "dest": "server/server.js" },
    { "src": "/(.*)", "dest": "client/build/$1" },
    { "src": "/(?!api|uploads)(.*)", "dest": "client/build/index.html" }
  ]
}
```

---

## Key Features for Production

✅ **Environment Variables**: Secure API keys in Vercel Dashboard
✅ **HTTPS/SSL**: Automatic SSL by Vercel
✅ **Serverless Functions**: Node.js backend as functions
✅ **Static Optimization**: React build pre-optimized
✅ **CDN**: Automatic global CDN distribution
✅ **Analytics**: Built-in performance analytics
✅ **Automatic Redeploys**: On GitHub push

---

## Vercel-Specific Configurations

### 1. Server Configuration

The Express server runs as a Vercel Serverless Function.

**Important**: All API routes should start with `/api`

Example in `server/server.js`:
```javascript
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/materials', require('./routes/materials'));
```

### 2. Client Configuration

React app builds to `client/build` and serves static assets.

**Important**: All client routes must be SPA-compatible (handled by index.html)

### 3. File Uploads

Uploads stored in `/uploads` directory. For production, consider:
- **AWS S3**: Cloud storage (recommended)
- **Supabase**: PostgreSQL with storage
- **MongoDB GridFS**: Document database storage

---

## Monitoring & Debugging

### View Logs
```bash
vercel logs <deployment-url>
```

### Local Preview
```bash
vercel
```

### Environment Check
```bash
vercel env list
```

---

## Performance Tips

1. **Image Optimization**: Use LazyImage component (already implemented)
2. **Code Splitting**: React Router automatically splits code
3. **Compression**: gzip compression enabled in Express
4. **Caching**: Set proper Cache-Control headers
5. **API Optimization**: Use pagination for lists

---

## Troubleshooting

### Build Fails
- Check `npm run build` works locally
- Verify all environment variables set
- Check Node.js version compatibility

### CORS Errors
- Update `CORS_ORIGIN` in environment variables
- Add domain to `Access-Control-Allow-Origin`

### Database Connection
- Verify MongoDB URI in environment
- Check IP whitelist on MongoDB Atlas
- Test connection string locally

### Upload Directory Missing
- Vercel doesn't persist file uploads between deployments
- Use cloud storage (S3/Supabase) for production
- Or use MongoDB GridFS for file storage

---

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create MongoDB Atlas account at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create cluster (free tier available)
3. Get connection string
4. Add to Vercel environment variables as `MONGODB_URI`

### Local Development

```bash
# Install MongoDB locally
# Start MongoDB
mongod

# Set .env
MONGODB_URI=mongodb://localhost:27017/kisan-ka-shati
```

---

## Custom Domain Setup

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records:
   - **A Record**: `76.76.19.165` (Vercel IP)
   - **CNAME Record**: `cname.vercel.com`
4. Wait for DNS propagation (up to 48 hours)

---

## Post-Deployment Checklist

- ✅ Environment variables set correctly
- ✅ MongoDB connection working
- ✅ Authentication (login/signup) functional
- ✅ Crop management (create/edit/delete) works
- ✅ Material tracking operational
- ✅ Analytics page loads data
- ✅ PDF export works
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Language switching works
- ✅ Offline mode (Service Worker) active

---

## Rollback Procedure

If deployment has issues:

1. Go to Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "Promote to Production"
4. Select "Redeploy"

---

## Cost Optimization

- **Vercel Hobby**: Free tier (great for testing)
- **Vercel Pro**: $20/month (recommended for production)
- **MongoDB Atlas**: Free tier 512MB (upgrade as needed)

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Express on Vercel**: https://vercel.com/guides/nodejs
- **React Deployment**: https://create-react-app.dev/deployment/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

## Security Best Practices

1. **Environment Variables**: Never commit .env files
2. **JWT Secret**: Use strong, random secrets (32+ chars)
3. **CORS**: Only allow trusted origins
4. **Rate Limiting**: Already implemented in Express
5. **HTTPS**: Always use (automatic on Vercel)
6. **Input Validation**: Already implemented with express-validator
7. **Password Hashing**: Using bcryptjs (already implemented)

---

## Deployment Date

**Deployed**: January 23, 2026
**Framework**: React 19.2.3 + Express 4.18.2 + MongoDB
**Hosting**: Vercel
**Database**: MongoDB Atlas

---

For production support, contact: support@kisan-ka-shati.com
