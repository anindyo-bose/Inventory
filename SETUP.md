# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up Backend Environment**
   ```bash
   cd backend
   # Create .env file (or copy from .env.example if it exists)
   # Add: JWT_SECRET=your-secret-key-here
   # Add: PORT=5000
   ```

3. **Start the Application**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start both:
   - Backend server on http://localhost:5000
   - Frontend app on http://localhost:3000

## Manual Setup

### Backend Setup
```bash
cd backend
npm install
# Create .env file with JWT_SECRET and PORT
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Login Credentials

All users have the same password: `admin123`

- **Super Admin**: username: `superadmin`
- **Admin**: username: `admin`
- **User**: username: `user`
- **Viewer**: username: `viewer`

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
- Backend: Change PORT in backend/.env
- Frontend: Set PORT environment variable before starting

### CORS Issues
Make sure the frontend proxy in `frontend/package.json` points to the correct backend URL.

### Module Not Found
Run `npm install` in both backend and frontend directories.




