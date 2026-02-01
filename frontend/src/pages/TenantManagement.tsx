/**
 * Tenant Management Page
 * 
 * Super Admin only page to:
 * - Create new tenants
 * - View all tenants
 * - Manage tenant members
 * - Assign/remove users
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './TenantManagement.css';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

interface TenantMember {
  userId: number;
  username: string;
  email: string;
  tenantRole: string;
  joinedAt: string;
}

interface TenantDetails extends Tenant {
  members: TenantMember[];
  memberCount: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name: string;
}

const TenantManagement: React.FC = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantDetails | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState('viewer');

  // Fetch tenants on mount
  useEffect(() => {
    fetchTenants();
    fetchAllUsers();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tenants');
      setTenants(response.data.tenants);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users');
      setAllUsers(response.data.users);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchTenantDetails = async (tenantId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tenants/${tenantId}`);
      // The response has tenant, members, memberCount
      const tenantWithMembers: TenantDetails = {
        ...response.data.tenant,
        members: response.data.members,
        memberCount: response.data.memberCount
      };
      setSelectedTenant(tenantWithMembers);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tenant details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/tenants', {
        name: newTenantName,
        slug: newTenantSlug,
      });
      
      // Add the newly created tenant to the list
      const newTenant = response.data.tenant;
      setTenants([...tenants, newTenant]);
      
      // Clear form
      setNewTenantName('');
      setNewTenantSlug('');
      setShowCreateForm(false);
      
      // Auto-select the newly created tenant
      await fetchTenantDetails(newTenant.id);
      
      setSuccess('Tenant created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserToTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !selectedUserId) return;

    try {
      setLoading(true);
      await axios.post(`/api/tenants/${selectedTenant.id}/users`, {
        userId: selectedUserId,
        role: selectedUserRole,
      });
      
      // Refresh tenant details
      await fetchTenantDetails(selectedTenant.id);
      setSelectedUserId(null);
      setSelectedUserRole('viewer');
      setShowAddUserForm(false);
      setSuccess('User added to tenant successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add user to tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserFromTenant = async (userId: number) => {
    if (!selectedTenant || !window.confirm('Remove user from tenant?')) return;

    try {
      setLoading(true);
      await axios.delete(`/api/tenants/${selectedTenant.id}/users/${userId}`);
      await fetchTenantDetails(selectedTenant.id);
      setSuccess('User removed from tenant successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    if (!selectedTenant) return;

    try {
      setLoading(true);
      await axios.patch(`/api/tenants/${selectedTenant.id}/users/${userId}`, {
        role: newRole,
      });
      await fetchTenantDetails(selectedTenant.id);
      setSuccess('User role updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  // Get users not already in the selected tenant
  const availableUsers = selectedTenant
    ? allUsers.filter(
        u => !selectedTenant.members.some(m => m.userId === u.id)
      )
    : [];

  // Check if user is Super Admin
  if (user?.role !== 'super_admin') {
    return (
      <div className="tenant-management">
        <div className="permission-denied">
          <h2>Access Denied</h2>
          <p>Only Super Admins can manage tenants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-management">
      <div className="tm-header">
        <h1>Tenant Management</h1>
        <p>Create and manage tenants and their members</p>
      </div>

      {error && <div className="tm-alert tm-error">{error}</div>}
      {success && <div className="tm-alert tm-success">{success}</div>}

      <div className="tm-container">
        {/* Left Panel: Tenant List */}
        <div className="tm-tenants-panel">
          <div className="tm-panel-header">
            <h2>Tenants</h2>
            <button
              className="tm-btn tm-btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={loading}
            >
              {showCreateForm ? 'Cancel' : '+ New Tenant'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateTenant} className="tm-form tm-create-form">
              <div className="tm-form-group">
                <label>Tenant Name *</label>
                <input
                  type="text"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  required
                  disabled={loading}
                />
              </div>

              <div className="tm-form-group">
                <label>Slug (URL-friendly) *</label>
                <input
                  type="text"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase())}
                  placeholder="e.g., acme-corp"
                  pattern="[a-z0-9-]+"
                  required
                  disabled={loading}
                />
                <small>Lowercase letters, numbers, and hyphens only</small>
              </div>

              <button
                type="submit"
                className="tm-btn tm-btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Tenant'}
              </button>
            </form>
          )}

          {loading && !selectedTenant && <p className="tm-loading">Loading tenants...</p>}

          <div className="tm-tenants-list">
            {tenants.length === 0 ? (
              <p className="tm-empty">No tenants yet. Create one to get started!</p>
            ) : (
              tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className={`tm-tenant-card ${
                    selectedTenant?.id === tenant.id ? 'active' : ''
                  }`}
                  onClick={() => fetchTenantDetails(tenant.id)}
                >
                  <h3>{tenant.name}</h3>
                  <p className="tm-slug">{tenant.slug}</p>
                  <p className={`tm-status tm-status-${tenant.status}`}>
                    {tenant.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Tenant Details */}
        <div className="tm-details-panel">
          {selectedTenant ? (
            <>
              <div className="tm-panel-header">
                <h2>{selectedTenant.name}</h2>
                <span className="tm-member-count">
                  {selectedTenant.memberCount} member{selectedTenant.memberCount !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="tm-tenant-info">
                <p>
                  <strong>Slug:</strong> {selectedTenant.slug}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`tm-status tm-status-${selectedTenant.status}`}>
                    {selectedTenant.status}
                  </span>
                </p>
                <p>
                  <strong>Created:</strong>{' '}
                  {new Date(selectedTenant.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="tm-members-section">
                <div className="tm-section-header">
                  <h3>Members</h3>
                  <button
                    className="tm-btn tm-btn-secondary tm-btn-sm"
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    disabled={loading || availableUsers.length === 0}
                  >
                    {showAddUserForm ? 'Cancel' : '+ Add Member'}
                  </button>
                </div>

                {showAddUserForm && (
                  <form onSubmit={handleAddUserToTenant} className="tm-form">
                    <div className="tm-form-group">
                      <label>Select User *</label>
                      <select
                        value={selectedUserId || ''}
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                        required
                        disabled={loading}
                      >
                        <option value="">-- Choose a user --</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.username})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="tm-form-group">
                      <label>Role *</label>
                      <select
                        value={selectedUserRole}
                        onChange={(e) => setSelectedUserRole(e.target.value)}
                        disabled={loading}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="tm-btn tm-btn-primary"
                      disabled={loading || !selectedUserId}
                    >
                      {loading ? 'Adding...' : 'Add Member'}
                    </button>
                  </form>
                )}

                {loading && <p className="tm-loading">Loading members...</p>}

                {selectedTenant.members.length === 0 ? (
                  <p className="tm-empty">No members yet. Add one to get started!</p>
                ) : (
                  <div className="tm-members-list">
                    {selectedTenant.members.map((member) => (
                      <div key={member.userId} className="tm-member-item">
                        <div className="tm-member-info">
                          <p className="tm-member-name">{member.username}</p>
                          <p className="tm-member-email">{member.email}</p>
                        </div>
                        <div className="tm-member-actions">
                          <select
                            value={member.tenantRole}
                            onChange={(e) =>
                              handleUpdateUserRole(member.userId, e.target.value)
                            }
                            disabled={loading}
                            className="tm-role-select"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            className="tm-btn tm-btn-danger tm-btn-sm"
                            onClick={() => handleRemoveUserFromTenant(member.userId)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="tm-empty-state">
              <p>Select a tenant to view details and manage members</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;
