/**
 * Tenant Selection Page
 * 
 * Shown between login and dashboard if user belongs to multiple tenants.
 * BACKWARD COMPATIBILITY: If user has no tenants or only one, skips to dashboard.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TenantSelector from '../components/TenantSelector';
import './TenantSelectPage.css';

const TenantSelectPage: React.FC = () => {
  const { user, selectedTenant, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
      return;
    }

    // If tenant already selected, go to dashboard
    if (selectedTenant) {
      navigate('/dashboard/transactions', { replace: true });
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, user, selectedTenant, navigate]);

  const handleTenantSelected = () => {
    // Redirect to dashboard after tenant selection
    navigate('/dashboard/transactions', { replace: true });
  };

  if (!isReady) {
    return <div className="tenant-select-loading">Loading...</div>;
  }

  return (
    <div className="tenant-select-page">
      <div className="tenant-select-container">
        <div className="tenant-select-header">
          <h1>Welcome, {user?.name}!</h1>
        </div>
        <TenantSelector onTenantSelected={handleTenantSelected} />
      </div>
    </div>
  );
};

export default TenantSelectPage;
