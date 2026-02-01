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

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
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

  useEffect(() => {
    // Check for stored auth data (encrypted)
    try {
      const encryptedToken = localStorage.getItem('auth_token');
      const encryptedUser = localStorage.getItem('auth_user');

      if (encryptedToken && encryptedUser) {
        // Decrypt stored data
        const decryptedToken = encryptionWrapper.decrypt(encryptedToken);
        const decryptedUser = encryptionWrapper.decrypt(encryptedUser);

        // Verify token is still valid (basic check - real validation happens at backend)
        if (decryptedToken && decryptedUser) {
          setToken(decryptedToken as string);
          setUser(decryptedUser as User);
          axios.defaults.headers.common['Authorization'] = `Bearer ${decryptedToken}`;
        }
      }
    } catch (error) {
      console.error('Error loading stored auth data:', error);
      // Clear corrupted data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
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
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Clear encrypted storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear repairFilter (not sensitive, so not encrypted)
    // localStorage.removeItem('repairFilter'); // Keep this for UX
    
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};





