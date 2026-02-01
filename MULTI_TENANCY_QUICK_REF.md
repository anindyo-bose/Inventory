# Multi-Tenancy Quick Reference

## 🚀 Quick Start

### 1. Start Backend (Development)
```bash
cd backend
NODE_ENV=development npm start
# Sample data auto-loads:
# - Super Admin (superadmin / admin123)
# - 2 Tenants (Demo Corp, Test Organization)  
# - 4 Users (superadmin, admin, user, viewer)
```

### 2. Start Frontend
```bash
cd frontend
npm start
```

### 3. Test Multi-Tenancy
```
1. Login as: superadmin / admin123
2. See tenant selector modal
3. Select "Demo Corp" 
4. View Demo Corp data only
5. Logout and login again to switch tenants
```

---

## 📋 API Endpoints Reference

### Tenant Management (Super Admin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/tenants` | Create new tenant |
| GET | `/api/tenants` | List all tenants |
| GET | `/api/tenants/:tenantId` | Get tenant details + members |
| POST | `/api/tenants/:tenantId/users` | Assign user to tenant |
| PATCH | `/api/tenants/:tenantId/users/:userId` | Update user's tenant role |
| DELETE | `/api/tenants/:tenantId/users/:userId` | Remove user from tenant |

### User Tenants (All Roles)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tenants/user/my-tenants` | Get user's tenants + roles |

### Example Requests

**Create Tenant (Super Admin)**
```bash
POST /api/tenants
{
  "name": "Acme Corp",
  "slug": "acme-corp"
}

Response: 201
{
  "tenant": {
    "id": 3,
    "name": "Acme Corp",
    "slug": "acme-corp",
    "status": "active",
    "createdAt": "2024-01-21T..."
  }
}
```

**Assign User to Tenant (Super Admin)**
```bash
POST /api/tenants/1/users
{
  "userId": 3,
  "role": "viewer"
}

Response: 201
{
  "membership": {
    "userId": 3,
    "tenantId": 1,
    "role": "viewer",
    "createdAt": "2024-01-21T..."
  }
}
```

**Get My Tenants (Any User)**
```bash
GET /api/tenants/user/my-tenants
Authorization: Bearer <token>

Response: 200
{
  "tenants": [
    {
      "id": 1,
      "name": "Demo Corp",
      "slug": "demo-corp",
      "status": "active",
      "userRole": "viewer",
      "joinedAt": "2024-01-15T..."
    }
  ],
  "total": 1
}
```

---

## 🔐 User Roles

### Global Roles
- `super_admin` - Super Admin (creates tenants, manages users globally)
- `admin` - Admin (can perform most operations)
- `user` - Regular user (can create/edit data)
- `viewer` - Viewer (read-only access)

### Tenant-Specific Roles
- `admin` - Full control in tenant
- `manager` - Can edit data in tenant
- `viewer` - Read-only in tenant

---

## 📊 Sample Data

### Users
```
Username    | Password  | Role       | Email
------------|-----------|------------|-------------------
superadmin  | admin123  | super_admin| superadmin@example.com
admin       | admin123  | admin      | admin@example.com
user        | admin123  | user       | user@example.com
viewer      | admin123  | viewer     | viewer@example.com
```

### Tenants
```
Name                  | Slug      | Status
----------------------|-----------|---------
Demo Corp            | demo-corp | active
Test Organization    | test-org  | active
```

### Memberships
```
User ID | Tenant ID | Role
--------|-----------|--------
1 (SA)  | 1         | admin
1 (SA)  | 2         | admin
2 (Adm) | 1         | admin
2 (Adm) | 2         | manager
3 (Usr) | 1         | viewer
4 (Vwer)| 2         | viewer
```

---

## 💾 Data Isolation Rules

### Record Visibility

```
Scenario 1: User has tenantId=1, Record has tenantId=1
Result: ✅ VISIBLE

Scenario 2: User has tenantId=1, Record has tenantId=2
Result: ❌ HIDDEN

Scenario 3: User has no tenantId, Record has no tenantId
Result: ✅ VISIBLE (legacy records, backward compat)

Scenario 4: User is Super Admin
Result: ✅ VISIBLE (all records, all tenants)
```

### New Records

When creating a record:
- If user has `tenantId` (not Super Admin) → `record.tenantId = user.tenantId`
- If user is Super Admin → `record.tenantId = undefined` (global record)
- Automatically applied by `addTenantId()` helper

---

## 🧪 Testing Checklist

### Test 1: Backward Compatibility
- [ ] Login as 'admin'
- [ ] Create transaction
- [ ] See all transactions (unchanged behavior)
- [ ] No tenant selector shown

### Test 2: Multi-Tenant
- [ ] Login as 'superadmin'
- [ ] See tenant selector
- [ ] Select "Demo Corp"
- [ ] Create repair
- [ ] Logout and login again
- [ ] Select "Test Org"
- [ ] Cannot see "Demo Corp" repairs

### Test 3: Super Admin
- [ ] Login as 'superadmin'
- [ ] POST /api/tenants to create new tenant
- [ ] POST /api/tenants/:id/users to assign user
- [ ] Verify user can access new tenant

### Test 4: Data Isolation
- [ ] User 1 in Tenant A sees only Tenant A data
- [ ] User 2 in Tenant B sees only Tenant B data
- [ ] Super Admin sees all data

---

## 🔧 Configuration

### Environment Variables (.env)
```bash
NODE_ENV=development        # Enable sample data
NODE_ENV=production         # Disable sample data
JWT_SECRET=your-secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Sample Data
- **Auto-loads**: Only in `development`
- **Location**: `backend/data/sampleData.js`
- **Idempotent**: Safe to run multiple times
- **No schema changes**: Works with existing DB

---

## 📁 File Structure Reference

```
backend/
├── models/
│   ├── tenant.js
│   └── membership.js
├── middleware/
│   ├── auth.js (existing)
│   └── tenantContext.js (NEW)
├── routes/
│   ├── auth.js (modified)
│   ├── transactions.js (modified)
│   ├── repairs.js (modified)
│   ├── suppliers.js (modified)
│   └── tenants.js (NEW)
├── utils/
│   ├── encryption.js (existing)
│   ├── jwtHelper.js (NEW)
│   └── dataIsolation.js (NEW)
└── data/
    └── sampleData.js (NEW)

frontend/src/
├── context/
│   └── AuthContext.tsx (modified)
├── components/
│   └── TenantSelector/
│       ├── TenantSelector.tsx (NEW)
│       ├── TenantSelector.css (NEW)
│       └── index.ts (NEW)
├── pages/
│   ├── TenantSelectPage.tsx (NEW)
│   └── TenantSelectPage.css (NEW)
└── App.tsx (modified)
```

---

## 🎯 Common Tasks

### Create a Tenant
```bash
POST /api/tenants
Authorization: Bearer <superadmin_token>
{
  "name": "Acme Corp",
  "slug": "acme-corp"
}
```

### Add User to Tenant
```bash
POST /api/tenants/1/users
Authorization: Bearer <superadmin_token>
{
  "userId": 3,
  "role": "admin"
}
```

### Change User's Role
```bash
PATCH /api/tenants/1/users/3
Authorization: Bearer <superadmin_token>
{
  "role": "manager"
}
```

### Remove User from Tenant
```bash
DELETE /api/tenants/1/users/3
Authorization: Bearer <superadmin_token>
```

### View My Tenants
```bash
GET /api/tenants/user/my-tenants
Authorization: Bearer <user_token>
```

---

## ⚠️ Important Notes

1. **Backward Compatible**: All existing functionality works unchanged
2. **Optional**: Tenant features can be ignored (no forced adoption)
3. **Development Only**: Sample data only loads in development
4. **No Schema Changes**: Works with existing data
5. **Security**: tenantId never from user input, always from JWT
6. **Super Admin**: Can access everything, including legacy data
7. **Data Isolation**: Enforced server-side, not client-side

---

## 📞 Troubleshooting

### Tenant Selector Not Showing
- Check if user has multiple memberships
- Verify backend returns data from `/api/tenants/user/my-tenants`
- Check browser console for errors

### Data Not Filtered
- Verify tenantContext middleware is applied
- Check JWT includes `tenantId`
- Look for tenant isolation comments in route files

### Sample Data Not Loading
- Verify `NODE_ENV=development`
- Check console for "✓ Initialized sample..." messages
- Ensure `backend/data/sampleData.js` exists

---

**Quick Reference Complete! For detailed information, see MULTI_TENANCY_GUIDE.md**
