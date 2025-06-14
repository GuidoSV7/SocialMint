'use client';

import { useBalance} from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import styles from '../styles.module.css';

interface WalletSectionProps {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletSection({ 
  isConnected, 
  address, 
  onConnect, 
  onDisconnect 
}: WalletSectionProps) {
  const { data: balance } = useBalance({
    address,
    chainId: avalancheFuji.id,
  });

  return (
    <div className={styles.walletSection}>
      <div className={styles.walletInfo}>
        <div className={styles.walletStatus}>
          <div className={`${styles.statusDot} ${isConnected ? styles.connected : ''}`} />
          <span>{isConnected ? `Conectado: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Desconectado'}</span>
        </div>
        <button 
          className={styles.connectBtn}
          onClick={isConnected ? onDisconnect : onConnect}
        >
          {isConnected ? 'Desconectar' : 'Conectar MetaMask'}
        </button>
      </div>
      
      {isConnected && (
        <div className={styles.contractInfo}>
          <div><strong>Cuenta:</strong> <span>{address}</span></div>
          <div><strong>Balance:</strong> <span>{balance?.formatted} {balance?.symbol}</span></div>
        </div>
      )}
    </div>
  );
} 