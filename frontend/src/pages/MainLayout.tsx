import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Dashboard from './Dashboard';
import TenantManagement from './TenantManagement';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="layout-wrapper">
        <Header />
        <main className="layout-main">
          <Routes>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/tenant-management" element={<TenantManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
