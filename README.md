# Inventory Management System

A full-stack application for store inventory and transaction management with role-based access control.

## Features

- **Authentication System**: Secure login with JWT tokens
- **Role-Based Access Control**: Four user roles (Super Admin, Admin, User, Viewer)
- **Transaction Management**: Create, view, edit, and delete transactions
- **Status Tracking**: Track "Selling Done" and "Payment Done" statuses
- **Modern UI**: Responsive and modular React components

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- CSS for styling

### Backend
- Node.js with Express
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation

## Project Structure

```
Inventory/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── transactions.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   └── TransactionManagement/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── package.json
```

## Installation

1. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

2. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

## Running the Application

### Development Mode (runs both frontend and backend)
```bash
npm run dev
```

### Run Separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

The backend will run on `http://localhost:5000`
The frontend will run on `http://localhost:3000`

## Demo Credentials

You can login with any of these accounts (password: `admin123`):

- **Super Admin**: `superadmin`
- **Admin**: `admin`
- **User**: `user`
- **Viewer**: `viewer`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Transactions
- `GET /api/transactions` - Get all transactions (protected)
- `GET /api/transactions/:id` - Get transaction by ID (protected)
- `POST /api/transactions` - Create new transaction (protected)
- `PUT /api/transactions/:id` - Update transaction (protected)
- `PATCH /api/transactions/:id/status` - Update transaction status (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)

## Features in Detail

### Transaction Management
- Create transactions with multiple items
- Track selling and payment status
- View transaction statistics
- Edit and delete transactions
- Real-time status updates

### Component Structure
All components are modular and reusable:
- `Header` - Navigation and user info
- `TransactionManagement` - Main container
- `TransactionStats` - Statistics cards
- `TransactionList` - Transaction grid
- `TransactionCard` - Individual transaction display
- `TransactionForm` - Create/edit form

## Future Enhancements

- Inventory management features
- User management for Super Admin
- Advanced reporting and analytics
- Database integration (currently using in-memory storage)
- File uploads and exports
- Real-time notifications

## License

ISC




