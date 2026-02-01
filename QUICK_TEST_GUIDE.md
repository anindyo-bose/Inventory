# Quick Testing Guide - New Tenant & Users

## What Was Added

✅ **New Tenant**: Acme Inc (acme-inc)
✅ **New Users** (3): john, jane, bob
✅ **User Mappings**: All 3 new users mapped to Acme Inc with different roles

## Test Credentials

```
Password for all: admin123
```

### Users to Test With:

| User | Username | Tenant | Role |
|------|----------|--------|------|
| Super Admin | superadmin | All tenants | Admin |
| John Doe | john | Acme Inc | Admin ✨ NEW |
| Jane Smith | jane | Acme Inc | Manager ✨ NEW |
| Bob Johnson | bob | Acme Inc | Viewer ✨ NEW |

## Testing Steps

### 1. View All Tenants (Super Admin)
```
Login: superadmin / admin123
Navigate to: Tenant Management
Expected: See 3 tenants (Demo Corp, Test Organization, Acme Inc)
```

### 2. View Tenant Members
```
In Tenant Management:
Click on "Acme Inc"
Expected: See john, jane, bob as members
- john: Admin role
- jane: Manager role
- bob: Viewer role
```

### 3. Test Data Isolation (John)
```
Login as: john / admin123
Expected: 
- See Tenant Selector showing "Acme Inc"
- Access transactions, repairs, suppliers
- Only see data for Acme Inc
- Cannot see Demo Corp or Test Org data
```

### 4. Test Data Isolation (Jane)
```
Login as: jane / admin123
Expected:
- See Tenant Selector showing "Acme Inc"
- Manager role allows more operations than viewer
- Still isolated from other tenants
```

### 5. Test Data Isolation (Bob)
```
Login as: bob / admin123
Expected:
- See Tenant Selector showing "Acme Inc"
- Viewer role (read-only access)
- Only see Acme Inc data
```

### 6. Add/Remove Users (Super Admin)
```
In Tenant Management as superadmin:
- Try adding existing users to new tenants
- Try removing users from tenants
- Try changing roles (admin/manager/viewer)
Expected: All operations work correctly
```

## API Endpoints to Test

### Get All Users
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/auth/users
```

### Get Tenant Details (with members)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/tenants/3
```

### Add User to Tenant
```bash
curl -X POST http://localhost:3000/api/tenants/3/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 5, "role": "admin"}'
```

## Expected Results

### ✅ Tenant Management UI
- [x] All 3 tenants visible in sidebar
- [x] Acme Inc shows 3 members
- [x] Can click to view/manage members
- [x] Can add/remove/edit members

### ✅ Data Isolation
- [x] john, jane, bob only see Acme Inc
- [x] admin, user, viewer only see their respective tenants
- [x] superadmin can see all

### ✅ Role-Based Access
- [x] Admin: Full access to tenant data
- [x] Manager: Modify access to tenant data
- [x] Viewer: Read-only access

## Troubleshooting

**"Can't login as john"**
- Make sure backend is running with `NODE_ENV=development`
- Sample data only loads in development mode

**"Don't see Acme Inc tenant"**
- Restart backend server
- Check browser console for errors
- Make sure you're logged in as superadmin

**"Can't see john/jane/bob in user dropdown"**
- Make sure `/api/auth/users` endpoint is working
- Verify token is valid
- Check network tab in DevTools

---

## Files to Review

- `backend/data/sampleData.js` - See tenant and membership structure
- `backend/routes/auth.js` - See user definitions
- `MULTI_TENANCY_GUIDE.md` - Full architecture documentation

---

**Status**: Ready for testing!
