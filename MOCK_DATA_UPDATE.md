# Mock Data Update - Sample Tenants & Users

## Summary of Changes

### New Tenant Created
**Acme Inc** (`acme-inc`)
- ID: 3
- Status: Active
- Created: February 1, 2024

### New Users Added (3 users)
1. **John Doe** (john / john@example.com)
   - ID: 5
   - Role: Admin
   - Mapped to: Acme Inc (Admin role)

2. **Jane Smith** (jane / jane@example.com)
   - ID: 6
   - Role: User
   - Mapped to: Acme Inc (Manager role)

3. **Bob Johnson** (bob / bob@example.com)
   - ID: 7
   - Role: User
   - Mapped to: Acme Inc (Viewer role)

## Complete Tenant-User Map

### Demo Corp (demo-corp)
- Super Admin (id: 1) - Admin role
- Admin User (id: 2) - Admin role
- Regular User (id: 3) - Viewer role

### Test Organization (test-org)
- Super Admin (id: 1) - Admin role
- Admin User (id: 2) - Manager role
- Viewer User (id: 4) - Viewer role

### Acme Inc (acme-inc) ✨ NEW
- John Doe (id: 5) - Admin role
- Jane Smith (id: 6) - Manager role
- Bob Johnson (id: 7) - Viewer role

## Test Credentials

All users can login with password: `admin123`

| Username | Email | Tenant Access |
|----------|-------|----------------|
| superadmin | superadmin@example.com | All (admin) |
| admin | admin@example.com | Demo Corp (admin), Test Org (manager) |
| user | user@example.com | Demo Corp (viewer) |
| viewer | viewer@example.com | Test Org (viewer) |
| john | john@example.com | Acme Inc (admin) ✨ NEW |
| jane | jane@example.com | Acme Inc (manager) ✨ NEW |
| bob | bob@example.com | Acme Inc (viewer) ✨ NEW |

## Files Modified

1. **`backend/routes/auth.js`**
   - Added 3 new users (john, jane, bob)
   - Users 5, 6, 7 with IDs, emails, and roles

2. **`backend/data/sampleData.js`**
   - Added new tenant: Acme Inc (ID: 3)
   - Added 3 new memberships mapping users 5, 6, 7 to tenant 3
   - Updated Super Admin to have access to all 3 tenants

## How to Test

1. **Start backend** (with development data):
   ```bash
   cd backend
   NODE_ENV=development npm start
   ```

2. **Login as different users** to see tenant-based data isolation:
   - Login as `john` / `admin123` → See only Acme Inc data
   - Login as `jane` / `admin123` → See only Acme Inc data (manager view)
   - Login as `bob` / `admin123` → See only Acme Inc data (viewer view)

3. **In Tenant Management UI** (as superadmin):
   - See all 3 tenants listed
   - See all 7 users available for assignment
   - Add/remove users from any tenant

## Data Isolation Verification

When you login as each user from Acme Inc:
- **john** (Admin) - Can see all Acme Inc data, can modify
- **jane** (Manager) - Can see Acme Inc data, limited modify
- **bob** (Viewer) - Can see Acme Inc data only, read-only

Their data is completely isolated from Demo Corp and Test Organization users.

---

**Status**: ✅ Mock data updated and ready for testing
**Last Updated**: February 1, 2026
