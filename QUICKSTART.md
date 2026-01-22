# Quick Setup Guide - किसान प्रॉफिट मित्र

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd "/home/sama/Kisan Ka Shati"
npm install
cd client
npm install
cd ..
```

### Step 2: Setup MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free forever tier)
3. Create a new cluster (M0 Free)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### Step 3: Create Environment Files

**Root folder - Create `.env` file:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kisan-db?retryWrites=true&w=majority
JWT_SECRET=kisanprofitmitra2024secretkey
PORT=5000
```

**client folder - Create `.env` file:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Run the App
```bash
npm run dev
```

**That's it!** Open http://localhost:3000 in your browser.

### Default Test Account (Optional)
You can create a test account:
- Name: Test Farmer
- Mobile: 9876543210
- Password: test123

---

## Deployment (Production)

### Deploy Backend to Render

1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your repository
5. Settings:
   - Build Command: `npm install`
   - Start Command: `node server/server.js`
6. Add Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (Render provides this)
7. Deploy!

### Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Root Directory: `client`
5. Add Environment Variable:
   - `REACT_APP_API_URL` = Your Render backend URL + `/api`
6. Deploy!

### Update Frontend to Use Production API

After backend is deployed, update `client/.env`:
```env
REACT_APP_API_URL=https://your-app-name.onrender.com/api
```

Redeploy frontend on Vercel.

---

## Troubleshooting

**Can't connect to MongoDB?**
- Check your connection string
- Whitelist IP: Go to MongoDB Atlas → Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)

**Frontend can't reach backend?**
- Check REACT_APP_API_URL in client/.env
- Make sure backend is running on port 5000

**File uploads not working?**
- Check that `uploads/` folder exists
- Check file size (max 5MB)

---

Need help? Check the full README.md
