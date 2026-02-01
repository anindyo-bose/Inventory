# Tenant Management UI Guide

## Overview

A complete **Tenant Management UI** has been added to the application, giving Super Admins a professional interface to create, manage, and configure tenants directly from the web application.

## Features

### 1. **Tenant Dashboard** 🏛️
- View all tenants in the system
- Create new tenants with name and slug
- Access tenant details and member management
- All Super Admin only features

### 2. **Tenant Creation Form**
- **Name**: Full name of the organization/tenant
- **Slug**: URL-friendly identifier (lowercase, numbers, hyphens only)
- Real-time validation
- Success/error notifications

### 3. **Member Management**
- **View all members** assigned to a tenant
- **Add members** from available users
- **Assign roles**: Admin, Manager, Viewer
- **Update roles** for existing members
- **Remove members** from tenant
- Clean, intuitive interface

### 4. **Access Control**
- Super Admin only access
- Permission denied message for non-Super Admins
- Role-based visibility in sidebar

## How to Use

### Access Tenant Management

1. **Login as Super Admin**
   ```
   Username: superadmin
   Password: admin123
   ```

2. **Navigate to Tenant Management**
   - From the sidebar, click **"🏛️ Tenant Management"**
   - Or visit: `/tenant-management`

### Create a New Tenant

1. Click **"+ New Tenant"** button
2. Fill in the form:
   - **Tenant Name**: e.g., "Acme Corporation"
   - **Slug**: e.g., "acme-corp"
3. Click **"Create Tenant"**
4. Tenant appears in the list on the left

### Manage Tenant Members

1. **Select a tenant** from the left panel
2. **View members** section shows current team members
3. **Add Member**:
   - Click **"+ Add Member"**
   - Select user from dropdown
   - Choose role (Admin/Manager/Viewer)
   - Click **"Add Member"**
4. **Update Role**:
   - Click the role dropdown next to the member
   - Select new role
   - Changes apply immediately
5. **Remove Member**:
   - Click **"Remove"** button
   - Confirm deletion
   - Member is removed from tenant

## UI Components

### File Structure
```
frontend/src/
├── pages/
│   ├── TenantManagement.tsx          # Main component
│   ├── TenantManagement.css          # Styling
├── components/
│   ├── Sidebar/
│   │   └── Sidebar.tsx               # Updated with tenant management link
```

### Component Features
- **Responsive Design**: Works on desktop, tablet, mobile
- **Real-time Feedback**: Alerts for success/error states
- **Loading States**: Visual indicators during API calls
- **Empty States**: Clear messaging when no data exists
- **Two-Panel Layout**: List view + Details view

## API Endpoints Used

### Tenants API
```
GET    /api/tenants                      # List all tenants
POST   /api/tenants                      # Create new tenant
GET    /api/tenants/:id                  # Get tenant details with members
POST   /api/tenants/:id/users            # Add user to tenant
PATCH  /api/tenants/:id/users/:userId    # Update user role
DELETE /api/tenants/:id/users/:userId    # Remove user from tenant
GET    /api/tenants/user/my-tenants      # Get user's tenants
```

### Users API (new)
```
GET    /api/auth/users                   # Get all users (Super Admin only)
```

## Sample Data

When running in development mode (`NODE_ENV=development`), the app includes sample tenants:

### Tenants
1. **Demo Corp** (demo-corp)
   - Status: Active
   - Members: admin, user

2. **Test Organization** (test-org)
   - Status: Active
   - Members: admin, user

### Users
- **superadmin**: Super Admin (can create/manage all tenants)
- **admin**: Admin (has 2 tenants with admin role)
- **user**: Regular User (has 2 tenants with manager role)
- **viewer**: Viewer (no tenants)

## Styling

### Color Scheme
- **Primary**: Blue (#4285f4) - Buttons, active states
- **Success**: Green (#2e7d32) - Active status
- **Danger**: Red (#f44336) - Delete, suspended status
- **Background**: Light gray (#f5f5f5, #fafafa)
- **Text**: Dark gray (#333, #666)

### Responsive Breakpoints
- **Desktop**: 1024px+ (two-panel layout)
- **Tablet**: 768px - 1024px (one-panel with list hidden on mobile)
- **Mobile**: < 768px (single panel view)

## Common Tasks

### Create a Tenant for a Client
1. Go to Tenant Management
2. Click "+ New Tenant"
3. Enter client name and slug
4. Click Create
5. Click on the tenant to select it
6. Click "+ Add Member"
7. Add team members and assign roles

### Manage Team Members
1. Select tenant from list
2. View current members in Members section
3. To add: Click "+ Add Member"
4. To change role: Select from role dropdown
5. To remove: Click "Remove" button

### Switch Between Tenants
1. Click on different tenant in the list
2. Details panel updates automatically
3. Shows all members for that tenant

## Troubleshooting

### Cannot See Tenant Management
**Issue**: Tenant Management link not visible in sidebar
**Solution**: 
- Make sure you're logged in as Super Admin
- Login with username: `superadmin`, password: `admin123`
- Only Super Admins can see this option

### Add Member Button Disabled
**Issue**: "+ Add Member" button is disabled/grayed out
**Solution**:
- All available users may already be added to the tenant
- Create a new user first, then add them
- Or remove some members to free up space

### Changes Not Saving
**Issue**: When you make changes, they don't persist
**Solution**:
- Check browser console for errors
- Verify backend API is running
- Check if you have Super Admin permissions
- Try refreshing the page

### Tenant Not Created
**Issue**: Form submission doesn't create tenant
**Solution**:
- Verify slug only contains lowercase, numbers, hyphens
- Check if tenant name is not empty
- Look for error message in alert
- Check backend logs

## Security Notes

✅ **Super Admin Only**
- Only users with `super_admin` role can access this page
- All endpoints require Super Admin authentication

✅ **No Passwords Exposed**
- User passwords are never displayed in the UI
- Only non-sensitive user data shown

✅ **Input Validation**
- Tenant name and slug are validated
- Slug format enforced (lowercase, numbers, hyphens)
- All inputs sanitized on backend

✅ **Role-Based Access**
- Different users can only manage tenants they belong to
- Super Admin can manage all tenants
- Member assignment controls who accesses tenant data

## Advanced Features

### Filtering Users
The "Add Member" dropdown automatically:
- Shows only available users
- Hides users already in the tenant
- Prevents duplicate assignments

### Real-Time Updates
After any action (create, add, update, remove):
- UI updates immediately
- Confirmation message shown
- Automatically refreshes tenant details

### Status Indicators
- **Active** (green) - Tenant is operational
- **Suspended** (red) - Tenant access restricted
- Member count displayed at top

## Integration with Data Isolation

Once you assign users to a tenant:
1. Users see only their assigned tenant in the selector
2. Data access automatically isolated by tenant
3. Transactions, repairs, suppliers filtered by tenant
4. Users cannot access data from other tenants

## Next Steps

1. ✅ Login as Super Admin
2. ✅ Navigate to Tenant Management
3. ✅ Create your first tenant
4. ✅ Add team members
5. ✅ Assign roles
6. ✅ Verify users can access their tenant data

## Related Documentation

- `MULTI_TENANCY_GUIDE.md` - Complete architecture guide
- `MULTI_TENANCY_QUICK_REF.md` - API quick reference
- `MULTI_TENANCY_TESTING.md` - Testing procedures
- `SECURITY.md` - Security implementation details

---

**Last Updated**: February 2026
**Status**: ✅ Complete and Ready for Use
