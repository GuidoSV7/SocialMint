'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../styles.module.css';

interface Event {
  code: string;
  name: string;
  participants: any[];
  createdBy: string;
}

export default function RegisterTab() {
  const { address } = useAccount();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual data fetching
  const events: Event[] = [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      setError('Por favor, conecta tu wallet primero');
      return;
    }

    if (!selectedEvent || !twitterHandle || !walletAddress) {
      setError('Completa todos los campos');
      return;
    }

    // Basic wallet address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError('Dirección de wallet inválida');
      return;
    }

    // Twitter handle validation
    if (!twitterHandle.startsWith('@')) {
      setError('El usuario de Twitter debe comenzar con @');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const event = events.find(e => e.code === selectedEvent && e.createdBy === address);
      if (!event) {
        setError('Evento no encontrado o no tienes permisos');
        return;
      }

      // Check if participant is already registered
      const isAlreadyRegistered = event.participants.some(
        p => p.twitter.toLowerCase() === twitterHandle.toLowerCase() || 
             p.address.toLowerCase() === walletAddress.toLowerCase()
      );

      if (isAlreadyRegistered) {
        setError('Este usuario o wallet ya está registrado en el evento');
        return;
      }

      // TODO: Implement actual registration logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay

      setSuccess('¡Registro exitoso!');
      
      // Reset form
      setSelectedEvent('');
      setTwitterHandle('');
      setWalletAddress('');

    } catch (error) {
      setError('Error al registrar participante: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <div className={styles.noEventsMessage}>
        Conecta tu wallet para registrar participantes.
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.noEventsMessage}>
        No tienes eventos creados aún.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.formSection}>
        <label htmlFor="eventSelect">Selecciona un evento *</label>
        <select
          id="eventSelect"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          required
        >
          <option value="">-- Selecciona --</option>
          {events.map(event => (
            <option key={event.code} value={event.code}>
              {event.name} ({event.code}) - {event.participants.length} participantes
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formSection}>
        <label htmlFor="twitterInput">Usuario de Twitter *</label>
        <input
          type="text"
          id="twitterInput"
          value={twitterHandle}
          onChange={(e) => setTwitterHandle(e.target.value)}
          required
          placeholder="@usuario"
        />
      </div>

      <div className={styles.formSection}>
        <label htmlFor="walletInput">Dirección de Wallet *</label>
        <input
          type="text"
          id="walletInput"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          required
          placeholder="0x..."
        />
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? 'Registrando...' : 'Registrarme'}
      </button>
    </form>
  );
} 