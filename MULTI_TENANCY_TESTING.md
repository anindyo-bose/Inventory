# Multi-Tenancy Testing Guide - How to See the Tenant Selector

## ✅ Quick Test (5 Minutes)

### Step 1: Start Backend with Development Mode
```bash
cd backend
NODE_ENV=development npm start
```

**Expected Output:**
```
✓ Initialized sample tenants
✓ Initialized sample memberships
Server is running on port 5000
```

### Step 2: Start Frontend
```bash
cd frontend
npm start
```

Frontend will open at `http://localhost:3000`

### Step 3: Login as Admin User
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Do NOT use 'superadmin' - login as 'admin' because the admin user has memberships in 2 tenants!

### Step 4: See Tenant Selector
After login, you should see a **modal window** with:
- Title: "Select Your Workspace"
- Two tenant options:
  - Demo Corp (Role: admin)
  - Test Organization (Role: manager)

### Step 5: Select a Tenant
Click on one of the tenants to proceed to dashboard.

---

## 📋 User Access Matrix

| User | Tenants | Expected Behavior |
|------|---------|-------------------|
| **superadmin** | 2 (both) | Shows tenant selector, then global access |
| **admin** | 2 (both) | ✅ **Shows tenant selector** |
| **user** | 1 (Demo Corp) | Auto-selects, no selector shown |
| **viewer** | 1 (Test Org) | Auto-selects, no selector shown |

---

## 🔍 Verify Sample Data Loaded

### Check Backend Console
Look for these messages on server startup:
```
✓ Initialized sample tenants
✓ Initialized sample memberships
```

If these don't appear:
- ✅ Verify `NODE_ENV=development` is set
- ✅ Check `backend/data/sampleData.js` exists
- ✅ Restart backend with: `NODE_ENV=development npm start`

### Check API Directly

**Get all tenants (as superadmin)**
```bash
curl http://localhost:5000/api/tenants \
  -H "Authorization: Bearer <superadmin_token>"
```

**Get my tenants (as any user)**
```bash
curl http://localhost:5000/api/tenants/user/my-tenants \
  -H "Authorization: Bearer <user_token>"
```

---

## 🐛 Troubleshooting

### Tenant Selector Not Appearing

**Issue**: After login, no modal appears
**Causes & Solutions**:

1. **Wrong user logged in**
   - ✅ Login as **admin** (not superadmin)
   - ✅ admin user has 2 tenants assigned

2. **Backend not in development mode**
   - ✅ Stop backend (Ctrl+C)
   - ✅ Run: `NODE_ENV=development npm start`
   - ✅ Check for "✓ Initialized sample..." messages

3. **Browser cache issue**
   - ✅ Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - ✅ Clear localStorage: Open DevTools → Application → LocalStorage → Clear All

4. **Network issue**
   - ✅ Open browser DevTools (F12)
   - ✅ Go to Network tab
   - ✅ Look for GET `/api/tenants/user/my-tenants` request
   - ✅ Should return 200 with tenant data

### Check Browser Console

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Look for error messages
4. Check for warnings about missing data

### Manual Data Check

Verify sample data is present:

**File**: `backend/data/sampleData.js`
- ✅ Should have 2 tenants defined
- ✅ Should have 6 memberships
- ✅ Admin user should be in both tenants

---

## 📊 Sample Data Details

### Users
```
Username  | Password  | Tenants           | Expected UI
----------|-----------|-------------------|------------------------
superadmin| admin123  | 2 (Demo, Test)    | Selector appears (admin)
admin     | admin123  | 2 (Demo, Test)    | Selector appears (admin/manager)
user      | admin123  | 1 (Demo Corp)     | Auto-select, no selector
viewer    | admin123  | 1 (Test Org)      | Auto-select, no selector
```

### Tenants
```
ID | Name                | Slug
---|---------------------|----------
1  | Demo Corp          | demo-corp
2  | Test Organization  | test-org
```

### Memberships
```
User ID | Tenant ID | Role
--------|-----------|--------
1       | 1         | admin       (Super Admin → Demo Corp)
1       | 2         | admin       (Super Admin → Test Org)
2       | 1         | admin       (Admin → Demo Corp)
2       | 2         | manager     (Admin → Test Org) ← Shows selector!
3       | 1         | viewer      (User → Demo Corp)
4       | 2         | viewer      (Viewer → Test Org)
```

---

## ✅ Step-by-Step Test Walkthrough

### Test 1: See Tenant Selector (5 min)
```
1. Terminal 1: cd backend && NODE_ENV=development npm start
2. Terminal 2: cd frontend && npm start
3. Wait for frontend to open
4. Login: admin / admin123
5. ✅ See modal: "Select Your Workspace"
6. ✅ Two tenants listed
7. Click "Demo Corp"
8. ✅ See dashboard (transactions, repairs, etc.)
```

### Test 2: Switch Tenants (3 min)
```
1. From dashboard, logout
2. Login: admin / admin123 (again)
3. ✅ Tenant selector appears again
4. Select "Test Organization" (different tenant)
5. ✅ See dashboard (different tenant's data)
```

### Test 3: Single Tenant User (3 min)
```
1. Logout
2. Login: user / admin123
3. ✅ NO selector appears (only 1 tenant)
4. ✅ Directly to dashboard
5. Go to "Suppliers"
6. ✅ Should be empty or tenant-filtered
```

### Test 4: Super Admin Global Access (3 min)
```
1. Logout
2. Login: superadmin / admin123
3. ✅ Tenant selector appears
4. Select "Demo Corp"
5. ✅ Can see Demo Corp data
6. ✅ Create new repair/transaction
7. Logout, login as admin
8. ✅ Both users see same data (shared tenant)
```

---

## 🚀 If Still Not Working

### Reset Everything
```bash
# Terminal 1
cd backend
rm -r node_modules
npm install
NODE_ENV=development npm start

# Terminal 2 (new terminal)
cd frontend
rm -r node_modules
npm install
npm start
```

### Check File Structure
Verify these files exist:
```
backend/
  ├── data/sampleData.js              ✅
  ├── middleware/tenantContext.js     ✅
  ├── models/tenant.js                ✅
  ├── models/membership.js            ✅
  ├── routes/tenants.js               ✅
  └── utils/dataIsolation.js          ✅

frontend/src/
  ├── components/TenantSelector/      ✅
  ├── pages/TenantSelectPage.tsx       ✅
  └── context/AuthContext.tsx         ✅
```

### Enable Debug Logging

Add to `frontend/src/components/TenantSelector/TenantSelector.tsx`:
```typescript
useEffect(() => {
  console.log('TenantSelector mounted');
  console.log('User:', user);
  console.log('Selected tenant:', selectedTenant);
  console.log('Tenants:', tenants);
}, [user, selectedTenant, tenants]);
```

Then check browser console (F12) for these logs.

---

## 🎯 What You Should See

### Login Page
```
┌─────────────────────────────────┐
│     Inventory Login System      │
│                                 │
│  Username: [ admin            ]│
│  Password: [ ••••••••• ]        │
│            [ Login   ]          │
└─────────────────────────────────┘
```

### Tenant Selector Modal (After Login)
```
┌──────────────────────────────────────┐
│  ✕                                    │
│                                       │
│  Select Your Workspace               │
│  You belong to multiple organizations│
│                                       │
│  ┌──────────────────────────────┐   │
│  │ Demo Corp                    │ › │
│  │ Role: admin                  │   │
│  └──────────────────────────────┘   │
│                                       │
│  ┌──────────────────────────────┐   │
│  │ Test Organization            │ › │
│  │ Role: manager                │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### After Selection (Dashboard)
```
Header: Welcome, admin
Menu:
  - Transactions
  - Repairs
  - Suppliers
  
Data shown for selected tenant only
```

---

## 📞 Quick Commands Reference

```bash
# Start backend with sample data
NODE_ENV=development npm start

# Check if sample data loads
grep "Initialized" <server_output>

# Test API endpoint
curl http://localhost:5000/api/tenants/user/my-tenants \
  -H "Authorization: Bearer <token>"

# Clear frontend cache
# In browser: F12 → Application → LocalStorage → Clear All
```

---

## ✨ Summary

**To see the tenant selector:**
1. ✅ Start backend: `NODE_ENV=development npm start`
2. ✅ Start frontend: `npm start`
3. ✅ Login as: **admin / admin123** (key: this user has 2 tenants!)
4. ✅ Tenant selector modal appears
5. ✅ Select a tenant
6. ✅ See multi-tenant dashboard

**If not showing:**
- ✅ Check NODE_ENV=development is set
- ✅ Check sample data messages in backend console
- ✅ Verify login as 'admin' user (not superadmin)
- ✅ Hard refresh browser
- ✅ Check browser console for errors (F12)

**Still stuck?** Check the troubleshooting section above!
