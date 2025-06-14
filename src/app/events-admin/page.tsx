'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import AdminHeader from './components/AdminHeader';
import WalletSection from './components/WalletSection';
import CreateEventTab from './components/CreateEventTab';
import EventsTab from './components/EventsTab';
import StatsTab from './components/StatsTab';
import RegisterTab from './components/RegisterTab';
import styles from './styles.module.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('create');
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleTabChange = (tab: string) => {
  console.log('POAP API Key:', process.env.NEXT_PUBLIC_POAP_API_KEY);
  console.log('Contract Address:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  console.log('API Key:', process.env.NEXT_PUBLIC_API_KEY);
  console.log('Infura API Key:', process.env.NEXT_PUBLIC_INFURA_API_KEY);
    setActiveTab(tab);
  };
  
  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <div className={styles.container}>
      <AdminHeader />
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'create' ? styles.active : ''}`}
          onClick={() => handleTabChange('create')}
        >
          Crear Evento
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'events' ? styles.active : ''}`}
          onClick={() => handleTabChange('events')}
        >
          📊 Mis Eventos
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => handleTabChange('stats')}
        >
          📈 Estadísticas
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
          onClick={() => handleTabChange('register')}
        >
          🧾 Registrarse a Evento
        </button>
      </div>

      <WalletSection 
        isConnected={isConnected}
        address={address}
        onConnect={handleConnect}
        onDisconnect={() => disconnect()}
      />

      <div className={styles.tabContent}>
        {activeTab === 'create' && <CreateEventTab />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'register' && <RegisterTab />}
      </div>
    </div>
  );
} 