import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import encryptionWrapper from '../utils/encryption';
import passwordHasher from '../utils/passwordHasher';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user' | 'viewer';
  name: string;
}

// Tenant representation for multi-tenancy
interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  userRole?: 'admin' | 'manager' | 'viewer'; // User's role in this tenant
  joinedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  selectedTenant: Tenant | null;
  userTenants: Tenant[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  selectTenant: (tenant: Tenant) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    // Check for stored auth data (encrypted)
    try {
      const encryptedToken = localStorage.getItem('auth_token');
      const encryptedUser = localStorage.getItem('auth_user');
      const storedSelectedTenant = localStorage.getItem('selected_tenant');

      if (encryptedToken && encryptedUser) {
        // Decrypt stored data
        const decryptedToken = encryptionWrapper.decrypt(encryptedToken);
        const decryptedUser = encryptionWrapper.decrypt(encryptedUser);

        // Verify token is still valid (basic check - real validation happens at backend)
        if (decryptedToken && decryptedUser) {
          setToken(decryptedToken as string);
          setUser(decryptedUser as User);
          axios.defaults.headers.common['Authorization'] = `Bearer ${decryptedToken}`;

          // Restore selected tenant if available
          if (storedSelectedTenant) {
            try {
              const tenant = JSON.parse(storedSelectedTenant);
              setSelectedTenant(tenant);
            } catch (e) {
              console.error('Error parsing stored tenant:', e);
              localStorage.removeItem('selected_tenant');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored auth data:', error);
      // Clear corrupted data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('selected_tenant');
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Sanitize username input (basic XSS prevention)
      const sanitizedUsername = username.trim().slice(0, 100);

      // Hash password before sending to server (additional security layer)
      const hashedPassword = passwordHasher.hashPassword(password);

      const response = await axios.post('/api/auth/login', { 
        username: sanitizedUsername, 
        password: hashedPassword  // Send hashed password
      });
      
      const { token: newToken, user: newUser } = response.data;

      if (!newToken || !newUser) {
        throw new Error('Invalid response from server');
      }

      setToken(newToken);
      setUser(newUser);

      // Encrypt and store token and user info
      const encryptedToken = encryptionWrapper.encrypt(newToken);
      const encryptedUser = encryptionWrapper.encrypt(newUser);

      localStorage.setItem('auth_token', encryptedToken);
      localStorage.setItem('auth_user', encryptedUser);

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Clear sensitive data from memory
      encryptionWrapper.clearSensitiveData(password);
      passwordHasher.clearPassword(password);

      // BACKWARD COMPATIBILITY: If multi-tenancy is not used, selectedTenant remains null
      // Applications without tenants will work as before
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedTenant(null);
    setUserTenants([]);
    
    // Clear encrypted storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('selected_tenant');
    
    // Clear repairFilter (not sensitive, so not encrypted)
    // localStorage.removeItem('repairFilter'); // Keep this for UX
    
    delete axios.defaults.headers.common['Authorization'];
  };

  /**
   * Select a tenant for the current session
   * Optional: Users only need to select a tenant if they belong to multiple tenants
   * BACKWARD COMPATIBILITY: If selectedTenant is null, app works without tenant context
   */
  const selectTenant = async (tenant: Tenant) => {
    try {
      // Store selected tenant (not encrypted as it's not sensitive)
      localStorage.setItem('selected_tenant', JSON.stringify(tenant));
      setSelectedTenant(tenant);
      
      // In a real implementation, you would refresh tenant-specific data here
      // For now, the tenant context is used by the backend via tenant middleware
    } catch (error) {
      console.error('Error selecting tenant:', error);
      throw new Error('Failed to select tenant');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        selectedTenant,
        userTenants,
        login,
        logout,
        selectTenant,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};





