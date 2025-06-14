'use client';

import { useAccount } from 'wagmi';
import styles from '../styles.module.css';

interface Event {
  code: string;
  name: string;
  duration: number;
  hashtags: string[];
  participants: any[];
  createdBy: string;
}

export default function EventsTab() {
  const { address } = useAccount();

  // TODO: Replace with actual data fetching
  const events: Event[] = [];

  if (!address) {
    return (
      <div className={styles.noEventsMessage}>
        Conecta tu wallet para ver tus eventos.
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
    <div className={styles.eventsList}>
      {events.map(event => (
        <div key={event.code} className={styles.eventCard}>
          <h3>{event.name}</h3>
          <p><strong>Código:</strong> {event.code}</p>
          <p><strong>Duración:</strong> {event.duration} segundos</p>
          <p><strong>Hashtags:</strong> {event.hashtags.map(tag => `#${tag}`).join(', ')}</p>
          <p><strong>Participantes:</strong> {event.participants.length}</p>
        </div>
      ))}
    </div>
  );
} 