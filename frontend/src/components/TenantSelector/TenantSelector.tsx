/**
 * Tenant Selector Component
 * 
 * Optional UI component shown after login if user belongs to multiple tenants.
 * BACKWARD COMPATIBILITY: 
 * - If user has no tenants or only one tenant, this component is not shown
 * - If tenant selection is not used, app continues normally
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './TenantSelector.css';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  userRole?: 'admin' | 'manager' | 'viewer';
  joinedAt?: string;
}

interface TenantSelectorProps {
  onTenantSelected: () => void; // Callback when tenant selection is complete
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({ onTenantSelected }) => {
  const { user, selectedTenant, selectTenant } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user's tenants
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/api/tenants/user/my-tenants');
        const { tenants: fetchedTenants } = response.data;

        setTenants(fetchedTenants);

        // If only one tenant, auto-select it
        if (fetchedTenants.length === 1) {
          await selectTenant(fetchedTenants[0]);
          onTenantSelected();
        }
        // If user already has a selected tenant, mark as done
        else if (selectedTenant) {
          onTenantSelected();
        }
      } catch (err: any) {
        console.error('Error fetching tenants:', err);
        // If endpoint doesn't exist or user has no tenants, that's fine
        // Just proceed without tenant selection (backward compatible)
        if (err.response?.status === 404 || tenants.length === 0) {
          onTenantSelected();
        } else {
          setError(err.response?.data?.message || 'Failed to load tenants');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && !selectedTenant) {
      fetchTenants();
    }
  }, [user, selectedTenant]);

  const handleSelectTenant = async (tenant: Tenant) => {
    try {
      setLoading(true);
      await selectTenant(tenant);
      onTenantSelected();
    } catch (err: any) {
      setError(err.message || 'Failed to select tenant');
    } finally {
      setLoading(false);
    }
  };

  // Don't show selector if:
  // 1. Already selected a tenant
  // 2. User has 0 or 1 tenants (auto-selected)
  // 3. Not loading and no tenants to show
  if (selectedTenant || tenants.length <= 1) {
    return null;
  }

  return (
    <div className="tenant-selector-overlay">
      <div className="tenant-selector-modal">
        <div className="tenant-selector-header">
          <h2>Select Your Workspace</h2>
          <p>You belong to multiple organizations. Please select one to continue.</p>
        </div>

        {loading && (
          <div className="tenant-selector-loading">
            <p>Loading workspaces...</p>
          </div>
        )}

        {error && (
          <div className="tenant-selector-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && tenants.length > 0 && (
          <div className="tenant-selector-list">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                className="tenant-selector-item"
                onClick={() => handleSelectTenant(tenant)}
                disabled={loading || tenant.status === 'suspended'}
              >
                <div className="tenant-info">
                  <h3>{tenant.name}</h3>
                  <p className="tenant-role">
                    Role: {tenant.userRole || 'member'}
                  </p>
                  {tenant.status === 'suspended' && (
                    <p className="tenant-suspended">This workspace is suspended</p>
                  )}
                </div>
                <div className="tenant-selector-arrow">›</div>
              </button>
            ))}
          </div>
        )}

        {!loading && tenants.length === 0 && !error && (
          <div className="tenant-selector-empty">
            <p>No workspaces available. Please contact your administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantSelector;
