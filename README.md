# Kisan Profit Mitra - किसान प्रॉफिट मित्र

## Full-Stack Web Application for Indian Farmers

A production-ready web application designed for Indian farmers to track their crop expenses, calculate profit/loss, and generate PDF reports. Built with React, Node.js, Express, and MongoDB.

### 🌟 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Crop Management**: Track multiple crops simultaneously
- **Digital Kheti Diary**: Add expenses gradually over months
- **Profit/Loss Calculator**: Automatic calculation when crop is completed
- **PDF Reports**: Generate detailed PDF reports in Hindi
- **Mobile-First Design**: Optimized for smartphones
- **Hindi Interface**: Fully designed for Hindi-speaking farmers
- **Cloud-Based**: Data persists even when your device is off

### 📋 Tech Stack

**Frontend:**
- React.js
- React Router
- Tailwind CSS
- Axios
- jsPDF

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File Upload)
- Express Validator

### 🚀 Getting Started

#### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free)
- npm or yarn

#### Installation

1. **Clone the repository**
```bash
cd "/home/sama/Kisan Ka Shati"
```

2. **Install dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. **Setup Environment Variables**

Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

Create a `.env` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Run the application**

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 📱 Usage Guide

1. **Sign Up**: Create an account with your name, mobile number, and password
2. **Login**: Access your dashboard
3. **Start a Crop**: Create a new crop with details (crop type, land size, start date)
4. **Add Expenses**: Record daily/weekly expenses as they occur
5. **Complete Crop**: Enter production details when harvest is done
6. **View Profit/Loss**: See automatic calculations
7. **Generate PDF**: Download detailed reports

### 🗂️ Project Structure

```
kisan-profit-mitra/
├── server/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & file upload
│   └── server.js        # Express app
├── client/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── context/     # Auth context
│   │   └── utils/       # API & PDF utilities
│   └── public/
├── uploads/             # Uploaded bills/receipts
├── package.json
└── README.md
```

### 🌐 Deployment

**Frontend (Vercel):**
```bash
cd client
npm run build
# Deploy the build folder to Vercel
```

**Backend (Render):**
- Connect your GitHub repository to Render
- Set environment variables in Render dashboard
- Deploy automatically on push

**Database (MongoDB Atlas):**
- Already cloud-hosted
- Update MONGODB_URI in environment variables

### 🔐 Environment Variables

**Backend (.env):**
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)

**Frontend (client/.env):**
- `REACT_APP_API_URL`: Backend API URL

### 📊 API Endpoints

**Authentication:**
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

**Crops:**
- POST `/api/crops` - Create new crop
- GET `/api/crops` - Get all crops
- GET `/api/crops/:id` - Get single crop
- PUT `/api/crops/:id` - Update crop
- PUT `/api/crops/:id/complete` - Complete crop
- DELETE `/api/crops/:id` - Delete crop

**Materials (Expenses):**
- POST `/api/materials` - Add expense
- GET `/api/materials?crop=:cropId` - Get expenses
- GET `/api/materials/:id` - Get single expense
- PUT `/api/materials/:id` - Update expense
- DELETE `/api/materials/:id` - Delete expense

### 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for development)
- Check your connection string format

**CORS Issues:**
- Ensure REACT_APP_API_URL is set correctly
- Check CORS configuration in server.js

**File Upload Issues:**
- Check uploads folder permissions
- Ensure file size is under 5MB

### 👨‍💻 Development

```bash
# Run tests
npm test

# Check for errors
npm run lint

# Format code
npm run format
```

### 📝 License

MIT

### 🙏 Support

For support, contact the development team or open an issue on GitHub.

---

**Made with ❤️ for Indian Farmers**
