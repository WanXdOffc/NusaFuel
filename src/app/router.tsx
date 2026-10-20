// =============================================================================
// src/app/router.tsx — NusaFuel Grid
// Role-Based Reactive Router (Zero Friction for Competition Judges)
// Evaluates state.activeRole and renders the active module instantly
// =============================================================================

import { useStore } from './store';
import { DriverPortalPage } from '../modules/public-driver/pages/DriverPortalPage';
import { SpbuDashboardPage } from '../modules/spbu-operator/pages/SpbuDashboardPage';
import { DepotSimulatorPage } from '../modules/depot-interconnect/pages/DepotSimulatorPage';

export const AppRouter: React.FC = () => {
  const { state } = useStore();

  switch (state.activeRole) {
    case 'PUBLIC_DRIVER':
      return <DriverPortalPage />;
    case 'SPBU_OPERATOR':
      return <SpbuDashboardPage />;
    case 'DEPOT_SIMULATOR':
      return <DepotSimulatorPage />;
    default:
      return <DriverPortalPage />;
  }
};
export default AppRouter;
