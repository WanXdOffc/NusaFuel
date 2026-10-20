// =============================================================================
// src/App.tsx — NusaFuel Grid
// Application shell — Stage 1: Foundation placeholder.
// Stage 2 will add routing, TopCommandNavbar, and role-based page rendering.
// =============================================================================

import { useStore } from './app/store.tsx';

function App() {
  const { state } = useStore();

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '24px', color: '#18191C' }}>
      <div className="top-brand-strip" />
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>
        ⛽ NusaFuel Grid — Stage 1: Foundation Ready
      </h1>
      <p style={{ color: '#646872', marginBottom: '16px' }}>
        Core automation engines, relational store, and seed data initialized successfully.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <Stat label="SPBU Stations" value={state.stations.length} />
        <Stat label="Fuel Tanks" value={state.tanks.length} />
        <Stat label="Time Slots" value={state.slots.length} />
        <Stat label="Queue Tickets" value={state.tickets.length} />
        <Stat label="Dispatches" value={state.dispatches.length} />
        <Stat label="Audit Logs" value={state.auditLogs.length} />
      </div>
      <p style={{ marginTop: '16px', color: '#646872', fontSize: '13px' }}>
        Active Role: <strong>{state.activeRole}</strong> |
        Simulated Date Parity: <strong>{state.simulatedDateIsOdd === null ? 'Real System Date' : state.simulatedDateIsOdd ? 'ODD (Ganjil)' : 'EVEN (Genap)'}</strong>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: '#F7F8FA',
      border: '1px solid #E6E8EC',
      borderRadius: '10px',
      padding: '16px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#FF5A5F' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#646872', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

export default App;
