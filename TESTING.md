# Testing Guide - किसान प्रॉफिट मित्र

## 🧪 How to Test Your Application

This guide helps you verify that all features work correctly before sharing with farmers.

---

## 📋 Pre-Testing Setup

### Option A: Local Testing (Requires MongoDB)

**If you have MongoDB Atlas:**
```bash
# Update .env with your MongoDB Atlas connection string
# Then run:
cd "/home/sama/Kisan Ka Shati"

# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
cd client
npm start
```

**If you don't have MongoDB:**
- Skip local testing
- Deploy directly and test production app
- See DEPLOYMENT.md for deployment steps

---

## ✅ Test Cases

### 1. Welcome Page
**URL:** http://localhost:3000/

- [ ] Page loads without errors
- [ ] Hindi text displays correctly
- [ ] "शुरू करें" button visible
- [ ] "लॉगिन करें" button visible
- [ ] All 4 feature icons visible
- [ ] Mobile responsive (test in DevTools)

**Expected:**
- Beautiful landing page with green gradient
- All Hindi characters readable
- Buttons clickable

---

### 2. User Signup
**Navigate:** Click "शुरू करें"

**Test Data:**
```
Name: टेस्ट किसान
Mobile: 9876543210
Password: test123
Confirm Password: test123
```

**Test Steps:**
- [ ] Fill all fields
- [ ] Click "पंजीकरण करें"
- [ ] Should redirect to dashboard
- [ ] Welcome message shows your name

**Test Validations:**
- [ ] Mobile accepts only 10 digits
- [ ] Password must be min 6 characters
- [ ] Passwords must match
- [ ] Duplicate mobile shows error

**Expected:**
- Successful signup
- Redirected to /dashboard
- Token saved (check Application → Local Storage in DevTools)

---

### 3. User Login
**Navigate:** Logout, then go to /login

**Test Data:**
```
Mobile: 9876543210
Password: test123
```

**Test Steps:**
- [ ] Enter credentials
- [ ] Click "लॉगिन करें"
- [ ] Should redirect to dashboard
- [ ] Same user, same data

**Test Errors:**
- [ ] Wrong password shows error
- [ ] Wrong mobile shows error
- [ ] Empty fields prevented

**Expected:**
- Successful login
- Session persists on refresh

---

### 4. Create Crop
**Navigate:** Dashboard

**Test Data:**
```
Crop Type: धान
Start Date: (today's date)
Expected Duration: 4
Land Size: 2.5
```

**Test Steps:**
- [ ] Click "नई फसल शुरू करें"
- [ ] Fill modal form
- [ ] Click "बनाएं"
- [ ] Crop appears on dashboard

**Test All Crop Types:**
- [ ] धान (Rice)
- [ ] गेहूं (Wheat)
- [ ] गन्ना (Sugarcane)

**Expected:**
- Crop card shows on dashboard
- Status: चालू
- Total cost: ₹0.00
- "विवरण देखें" button works

---

### 5. Add Material/Expense
**Navigate:** Click on a crop → Click "खर्च जोड़ें"

**Test Data 1 (Seeds):**
```
Date: (today)
Material Type: बीज
Material Name: धान बीज
Quantity: 50
Unit: किलोग्राम
Price: 2500
Notes: हाइब्रिड किस्म
```

**Test Data 2 (Fertilizer):**
```
Date: (today)
Material Type: खाद
Material Name: यूरिया
Quantity: 2
Unit: बोरी
Price: 1200
```

**Test Data 3 (Labor):**
```
Date: (today)
Material Type: मजदूरी
Material Name: रोपाई मजदूर
Quantity: 5
Unit: दिन
Price: 2000
```

**Test Steps:**
- [ ] Add multiple materials
- [ ] Try with bill image (upload JPG)
- [ ] Try with notes
- [ ] Verify each appears in crop details

**Test File Upload:**
- [ ] Upload JPG image < 5MB → Success
- [ ] Upload PNG image → Success
- [ ] Try 6MB file → Should show error
- [ ] Try TXT file → Should show error

**Expected:**
- Material added successfully
- Redirected back to crop details
- Total cost updates automatically
- Material listed with all details

---

### 6. View Crop Details
**Navigate:** Dashboard → Click any crop card

**Verify Left Panel:**
- [ ] Crop information correct
- [ ] Financial summary shows total cost
- [ ] All action buttons present:
  - [ ] + खर्च जोड़ें
  - [ ] फसल पूर्ण करें
  - [ ] 📄 PDF बनाएं
  - [ ] 🗑️ फसल हटाएं

**Verify Right Panel:**
- [ ] All materials listed
- [ ] Each material shows:
  - [ ] Material name
  - [ ] Material type
  - [ ] Date
  - [ ] Quantity
  - [ ] Price
  - [ ] Notes (if added)

**Expected:**
- Complete crop overview
- All expenses visible
- Running total accurate

---

### 7. Complete Crop
**Navigate:** Crop Details → Click "फसल पूर्ण करें"

**Test Data:**
```
Production Quantity: 50
Unit: क्विंटल
Selling Price: 2000
```

**Calculation:**
```
Total Cost: ₹5700 (from materials)
Total Income: 50 × 2000 = ₹100,000
Net Profit: ₹100,000 - ₹5,700 = ₹94,300
```

**Test Steps:**
- [ ] Fill production details
- [ ] Click "पूर्ण करें"
- [ ] Status changes to "पूर्ण"
- [ ] Profit shows in green
- [ ] "खर्च जोड़ें" and "पूर्ण करें" buttons disappear

**Test Loss Scenario:**
```
Production: 10 quintal
Selling Price: 500
Income: ₹5,000
Cost: ₹5,700
Loss: ₹700 (shows in red)
```

**Expected:**
- Accurate profit/loss calculation
- Color coding (green for profit, red for loss)
- Crop locked (no more expense additions)

---

### 8. Generate PDF
**Navigate:** Crop Details → Click "📄 PDF बनाएं"

**Test Steps:**
- [ ] Click button
- [ ] PDF downloads automatically
- [ ] Open PDF

**Verify PDF Contains:**
- [ ] Title: "किसान प्रॉफिट मित्र - रिपोर्ट"
- [ ] Crop details (name, dates, land)
- [ ] All expenses in table format
- [ ] Total cost
- [ ] Production details (if completed)
- [ ] Profit/loss (if completed)
- [ ] Generation timestamp
- [ ] Hindi text readable

**Expected:**
- Clean, professional PDF
- All information accurate
- File name: cropname-timestamp.pdf

---

### 9. Delete Crop
**Navigate:** Crop Details → Click "🗑️ फसल हटाएं"

**Test Steps:**
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Redirected to dashboard
- [ ] Crop no longer appears

**Expected:**
- Crop and all its materials deleted
- Clean deletion with confirmation

---

### 10. Dashboard Views
**Create Test Scenario:**
- Create 2 active crops
- Complete 1 crop
- Keep 1 active

**Verify Dashboard Shows:**
- [ ] "चालू फसलें (1)" section
- [ ] "पूर्ण फसलें (1)" section
- [ ] Each crop card accurate
- [ ] Profit shown on completed crops
- [ ] Clicking cards navigates correctly

**Expected:**
- Organized view of all crops
- Clear status differentiation

---

### 11. Authentication Flow
**Test Logout:**
- [ ] Click "लॉगआउट"
- [ ] Redirected to welcome page
- [ ] Cannot access /dashboard (redirects to login)

**Test Persistence:**
- [ ] Login
- [ ] Refresh page
- [ ] Still logged in
- [ ] Data intact

**Test Protection:**
- [ ] Logout
- [ ] Try to access /dashboard directly
- [ ] Should redirect to /login

**Expected:**
- Secure authentication
- Protected routes work
- Session persistence

---

### 12. Mobile Responsiveness

**Test on Different Sizes:**
```bash
# Chrome DevTools → Toggle Device Toolbar
# Test these devices:
```

**Phone (375x667):**
- [ ] Welcome page layouts correctly
- [ ] Forms are easy to fill
- [ ] Buttons large enough to tap
- [ ] Text readable without zooming
- [ ] Dashboard cards stack vertically

**Tablet (768x1024):**
- [ ] 2-column layout on dashboard
- [ ] Forms still full-width
- [ ] Comfortable reading

**Desktop (1920x1080):**
- [ ] Max-width containers
- [ ] 3-column crop cards
- [ ] Not too wide

**Test Touch Interactions:**
- [ ] All buttons tappable
- [ ] No hover-dependent features
- [ ] Smooth scrolling

**Expected:**
- Perfect on all screen sizes
- Mobile-first design shines

---

### 13. Error Handling

**Test Network Errors:**
- [ ] Stop backend server
- [ ] Try to login → Shows error
- [ ] Try to create crop → Shows error
- [ ] Error messages in Hindi

**Test Validation Errors:**
- [ ] Mobile < 10 digits → Error
- [ ] Password < 6 chars → Error
- [ ] Empty required fields → Prevented
- [ ] File > 5MB → Error message

**Test Edge Cases:**
- [ ] Very long crop names
- [ ] Very large prices (₹1,00,00,000)
- [ ] Zero quantity → Should work
- [ ] Negative price → Should prevent

**Expected:**
- Graceful error handling
- Helpful error messages in Hindi
- No app crashes

---

### 14. Performance

**Test Load Times:**
- [ ] Welcome page < 2 seconds
- [ ] Dashboard < 3 seconds
- [ ] Crop details < 2 seconds
- [ ] PDF generation instant

**Test with Data:**
- [ ] Create 10 crops
- [ ] Add 50+ materials total
- [ ] Dashboard still fast
- [ ] Scrolling smooth

**Expected:**
- Fast load times
- Smooth interactions
- No lag with reasonable data

---

## 🎯 Complete Test Scenario

**Full User Journey (30 minutes):**

1. [ ] Open welcome page
2. [ ] Signup as new user
3. [ ] Verify redirect to dashboard
4. [ ] Create Rice crop (2 bigha)
5. [ ] Add 5 different expenses over time
6. [ ] Create Wheat crop (3 bigha)
7. [ ] Add 3 expenses to wheat
8. [ ] Go back to rice crop
9. [ ] Complete rice crop with production
10. [ ] Verify profit calculation
11. [ ] Generate PDF for rice
12. [ ] Verify PDF content
13. [ ] View dashboard - see both crops
14. [ ] Test on mobile view
15. [ ] Logout
16. [ ] Login again
17. [ ] Verify all data persists
18. [ ] Test delete on wheat crop
19. [ ] Verify dashboard updated

**Expected: All steps work perfectly!**

---

## 🐛 Common Issues & Solutions

### Issue: "Network Error"
**Solution:** Backend not running or wrong API URL

### Issue: "MongoDB Connection Error"
**Solution:** Check MongoDB connection string in .env

### Issue: Hindi text shows boxes (□□)
**Solution:** Font not loading, check internet connection

### Issue: File upload fails
**Solution:** Check file size < 5MB and type (JPG/PNG/PDF)

### Issue: Page blank after login
**Solution:** Check browser console for errors

### Issue: PDF shows garbled text
**Solution:** jsPDF has limited Hindi support (known limitation)

---

## ✅ Sign-Off Checklist

Before showing to farmers:

- [ ] All 14 test categories passed
- [ ] Tested on actual mobile phone
- [ ] Tested on 3+ different browsers
- [ ] All error messages appropriate
- [ ] Performance acceptable
- [ ] Hindi text clear everywhere
- [ ] PDF generation works
- [ ] Authentication secure
- [ ] Data persists correctly
- [ ] Mobile UX smooth

**When all checked: App is ready for production!** 🚀

---

## 📊 Report Template

After testing, fill this:

```
TESTING REPORT
Date: __________
Tester: __________

✅ PASSED: ___ / 14 test categories
❌ FAILED: ___ / 14 test categories

Critical Issues:
- _______________________
- _______________________

Minor Issues:
- _______________________
- _______________________

Performance Notes:
- _______________________

Mobile Experience:
- _______________________

Recommendation:
[ ] Ready for deployment
[ ] Needs fixes
[ ] Major rework needed
```

---

**Happy Testing!** 🧪
