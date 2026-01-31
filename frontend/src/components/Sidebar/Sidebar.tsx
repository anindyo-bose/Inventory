import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import navigationConfig from '../../config/navigation.json';
import featureConfig from '../../config/features.json';
import './Sidebar.css';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles: string[];
  disabled?: boolean;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  type FeatureConfig = Record<string, boolean>;
  const features = featureConfig as FeatureConfig;

  const isFeatureEnabled = (id: string) => {
    // If feature flag is not defined, treat as enabled by default
    if (typeof features[id] === 'undefined') return true;
    return features[id];
  };

  // Filter navigation items based on user role
  const availableItems = navigationConfig.items.filter((item: NavigationItem) => {
    if (item.disabled) return false;
    if (!isFeatureEnabled(item.id)) return false;
    return item.roles.includes(user?.role || '');
  });

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-brand">
          <h2 className="brand-title">Inventory</h2>
          <p className="brand-subtitle">Management System</p>
        </div>
        <nav className="sidebar-nav">
          {availableItems.map((item: NavigationItem) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              disabled={item.disabled}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

