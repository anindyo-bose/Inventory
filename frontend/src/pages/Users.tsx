import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Users.css';

type Role = 'super_admin' | 'admin' | 'user' | 'viewer';

interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  name: string;
}

const defaultForm = {
  username: '',
  email: '',
  name: '',
  role: 'user' as Role,
  password: ''
};

const Users: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.role === 'super_admin';

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users');
      setUsers(response.data.users || []);
    } catch (err: any) {
      // Do not expose errors to non-super admins
      if (isSuperAdmin) {
        setError(err.response?.data?.message || 'Failed to load users');
      }
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await axios.post('/api/auth/users', form);
      setMessage('User created successfully');
      setForm(defaultForm);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="users-page">
        <div className="page-header">
          <h1>User Management</h1>
          <p className="welcome-text">Only Super Admins can manage users.</p>
        </div>
        <div className="users-card">
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p className="welcome-text">Create new users (Super Admin only)</p>
      </div>

      <div className="users-grid">
        <div className="users-card">
          <h2>Create User</h2>
          <form className="user-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. jdoe"
                required
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@example.com"
                required
              />
            </label>
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
            {message && <p className="success-text">{message}</p>}
            {error && <p className="error-text">{error}</p>}
          </form>
        </div>

        <div className="users-card">
          <h2>Existing Users</h2>
          {error && !message && <p className="error-text">{error}</p>}
          <div className="users-list">
            {users.length === 0 && <p>No users found.</p>}
            {users.map(u => (
              <div key={u.id} className="user-row">
                <div>
                  <strong>{u.name}</strong> ({u.username})
                  <div className="user-meta">{u.email}</div>
                </div>
                <span className={`role-badge role-${u.role}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;


