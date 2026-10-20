// =============================================================================
// src/app/router.tsx — NusaFuel Grid
// Enterprise Multi-Role Reactive Router with Public Landing, Login, & Portals
// =============================================================================

import React from 'react';
import { useAuth } from '../core/auth/authContext';
import { useStore } from './store';
import { PublicLandingPage } from '../modules/landing/pages/PublicLandingPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { DriverPortalPage } from '../modules/public-driver/pages/DriverPortalPage';
import { SpbuDashboardPage } from '../modules/spbu-operator/pages/SpbuDashboardPage';
import { DepotSimulatorPage } from '../modules/depot-interconnect/pages/DepotSimulatorPage';

export const AppRouter: React.FC = () => {
  const { currentPath, currentUser } = useAuth();
  const { state } = useStore();

  // Route 1: Explicit Login Route
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  // Route 2: Not logged in and on root landing page
  if (!currentUser && currentPath === '/') {
    return <PublicLandingPage />;
  }

  // Route 3: If not logged in but trying to access specific private route, show login
  if (!currentUser && (currentPath === '/operator' || currentPath === '/depot' || currentPath === '/admin-api')) {
    return <LoginPage />;
  }

  // Route 4: Logged-in user routes based on active role or currentPath
  if (currentPath === '/driver' || state.activeRole === 'PUBLIC_DRIVER') {
    return <DriverPortalPage />;
  }

  if (currentPath === '/operator' || state.activeRole === 'SPBU_OPERATOR') {
    return <SpbuDashboardPage />;
  }

  if (currentPath === '/depot' || currentPath === '/admin-api' || state.activeRole === 'DEPOT_SIMULATOR') {
    return <DepotSimulatorPage />;
  }

  // Default fallback
  return currentUser ? <DriverPortalPage /> : <PublicLandingPage />;
};
export default AppRouter;
