# Navigation Configuration Guide

The navigation sidebar is configured using a JSON file located at `frontend/src/config/navigation.json`.

## Adding New Navigation Items

To add a new navigation item, simply add an entry to the `items` array in `navigation.json`:

```json
{
  "id": "unique-id",
  "label": "Display Name",
  "path": "/dashboard/route-path",
  "icon": " icon-emoji",
  "roles": ["super_admin", "admin", "user", "viewer"],
  "disabled": false
}
```

### Field Descriptions

- **id**: Unique identifier for the navigation item
- **label**: Text displayed in the sidebar
- **path**: Route path (should start with `/dashboard/`)
- **icon**: Emoji or icon to display (you can use any emoji or icon character)
- **roles**: Array of user roles that can see this item. Available roles:
  - `super_admin`
  - `admin`
  - `user`
  - `viewer`
- **disabled**: Set to `true` to hide the item (useful for upcoming features)

## Example: Adding Inventory Management

1. Update `navigation.json`:
```json
{
  "id": "inventory",
  "label": "Inventory Management",
  "path": "/dashboard/inventory",
  "icon": "📦",
  "roles": ["super_admin", "admin", "user"],
  "disabled": false
}
```

2. Create the corresponding page component in `frontend/src/pages/Inventory.tsx`

3. Add the route in `frontend/src/pages/Dashboard.tsx`:
```tsx
<Route path="/inventory" element={<Inventory />} />
```

## Role-Based Access

Navigation items are automatically filtered based on the current user's role. Only items where the user's role is included in the `roles` array will be displayed.

## Current Navigation Items

- **Transaction Management**: Available to all roles
- **Inventory Management**: Disabled (coming soon)
- **Reports & Analytics**: Disabled, available to super_admin and admin
- **User Management**: Disabled, available only to super_admin




