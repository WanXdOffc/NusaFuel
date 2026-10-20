// =============================================================================
// src/core/auth/authContext.tsx — NusaFuel Grid
// Enterprise 3-Role Authentication Context for Provinsi Bali Fuel Infrastructure
// Roles: DRIVER (Warga), OPERATOR (Petugas SPBU), ADMIN_API (Dispatcher & API)
// =============================================================================

import React, { createContext, useContext, useState } from 'react';

export type AuthRole = 'DRIVER' | 'OPERATOR' | 'ADMIN_API';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  roleBadge: string;
  phone?: string;
  plateNumber?: string;
  vehicleType?: 'MOTOR' | 'MOBIL' | 'DARURAT';
  spbuId?: string;
  spbuName?: string;
  spbuCode?: string;
  institution?: string;
  avatarInitials: string;
}

export interface DemoAccount {
  role: AuthRole;
  title: string;
  subtitle: string;
  email: string;
  passwordHint: string;
  user: AuthUser;
}

export const DEMO_ACCOUNTS: Record<AuthRole, DemoAccount> = {
  DRIVER: {
    role: 'DRIVER',
    title: 'Pengendara / Warga Bali',
    subtitle: 'Akses antrean terverifikasi & booking kuota BBM',
    email: 'driver.bali@nusafuel.id',
    passwordHint: 'wargabali2026',
    user: {
      id: 'usr-driver-001',
      name: 'I Wayan Sudarma',
      email: 'driver.bali@nusafuel.id',
      role: 'DRIVER',
      roleBadge: 'WARGA BALI',
      phone: '+62 812-3456-7890',
      plateNumber: 'DK 4821 FB',
      vehicleType: 'MOBIL',
      institution: 'Masyarakat Umum (Buleleng)',
      avatarInitials: 'WS',
    },
  },
  OPERATOR: {
    role: 'OPERATOR',
    title: 'Petugas / Operator SPBU',
    subtitle: 'Terminal kasir POS, scanner QR, dan saklar kebijakan',
    email: 'operator.gajahmada@nusafuel.id',
    passwordHint: 'pertamina2026',
    user: {
      id: 'usr-operator-001',
      name: 'I Ketut Ariawan',
      email: 'operator.gajahmada@nusafuel.id',
      role: 'OPERATOR',
      roleBadge: 'OPERATOR SPBU',
      spbuId: 'spbu-buleleng-gajah-mada',
      spbuCode: '54.811.14',
      spbuName: 'SPBU 54.811.14 Gajah Mada Singaraja',
      institution: 'PT Pertamina Retail Regional Jatimbalinus',
      avatarInitials: 'KA',
    },
  },
  ADMIN_API: {
    role: 'ADMIN_API',
    title: 'Dispatcher Depot Pertamina',
    subtitle: 'Orkestrasi armada tangki Manggis & pengujian API',
    email: 'dispatcher.manggis@pertamina.id',
    passwordHint: 'depotmanggis2026',
    user: {
      id: 'usr-admin-001',
      name: 'Gede Agus Satria, S.T.',
      email: 'dispatcher.manggis@pertamina.id',
      role: 'ADMIN_API',
      roleBadge: 'DISPATCHER DEPOT',
      institution: 'Depot Pertamina Manggis & IT Logistics Bali',
      avatarInitials: 'GA',
    },
  },
};

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  currentPath: string;
  navigate: (path: string) => void;
  login: (email: string, password?: string, role?: AuthRole) => boolean;
  loginAsDemo: (role: AuthRole) => void;
  logout: () => void;
}

const STORAGE_KEY = 'nusafuel_auth_session_v2';
const PATH_KEY = 'nusafuel_current_path_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    try {
      const storedPath = localStorage.getItem(PATH_KEY);
      return storedPath || '/';
    } catch {
      return '/';
    }
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    try {
      localStorage.setItem(PATH_KEY, path);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (email: string, _password?: string, role: AuthRole = 'DRIVER'): boolean => {
    const demo = Object.values(DEMO_ACCOUNTS).find(
      (d) => d.email.toLowerCase() === email.trim().toLowerCase()
    );

    const userToLogin: AuthUser = demo
      ? demo.user
      : {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email: email.trim(),
          role,
          roleBadge:
            role === 'DRIVER'
              ? 'WARGA BALI'
              : role === 'OPERATOR'
              ? 'OPERATOR SPBU'
              : 'DISPATCHER DEPOT',
          avatarInitials: email.substring(0, 2).toUpperCase(),
        };

    setCurrentUser(userToLogin);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userToLogin));
    } catch {
      // ignore
    }

    // Direct user to their respective operational portal
    if (userToLogin.role === 'DRIVER') {
      navigate('/driver');
    } else if (userToLogin.role === 'OPERATOR') {
      navigate('/operator');
    } else {
      navigate('/depot');
    }
    return true;
  };

  const loginAsDemo = (role: AuthRole) => {
    const demo = DEMO_ACCOUNTS[role];
    setCurrentUser(demo.user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo.user));
    } catch {
      // ignore
    }

    if (role === 'DRIVER') {
      navigate('/driver');
    } else if (role === 'OPERATOR') {
      navigate('/operator');
    } else {
      navigate('/depot');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        currentPath,
        navigate,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
