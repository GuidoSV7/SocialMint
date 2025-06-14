'use client';

import { useAccount } from 'wagmi';
import styles from '../styles.module.css';

interface Event {
  code: string;
  name: string;
  hashtags: string[];
  participants: {
    twitter: string;
    address: string;
    registeredAt: string;
  }[];
  createdBy: string;
}

export default function StatsTab() {
  const { address } = useAccount();

  // TODO: Replace with actual data fetching
  const events: Event[] = [];

  if (!address) {
    return (
      <div className={styles.noEventsMessage}>
        Conecta tu wallet para ver las estadísticas.
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.noEventsMessage}>
        No hay eventos creados aún.
      </div>
    );
  }

  return (
    <div className={styles.eventsStatistics}>
      {events.map(event => (
        <div key={event.code} className={styles.eventStatCard}>
          <div className={styles.eventStatHeader}>
            <div className={styles.eventStatTitle}>{event.name}</div>
            <div className={styles.eventStatCode}>{event.code}</div>
          </div>
          
          <div className={styles.eventStatDetails}>
            <div className={styles.statDetailSection}>
              <div className={styles.statDetailTitle}>Hashtags/Menciones</div>
              <div className={styles.hashtagsList}>
                {event.hashtags.map(tag => (
                  <span key={tag} className={styles.hashtagDisplay}>#{tag}</span>
                ))}
              </div>
            </div>
            
            <div className={styles.statDetailSection}>
              <div className={styles.statDetailTitle}>Participantes Registrados</div>
              <div className={styles.participantsCount}>
                {event.participants.length}
              </div>
            </div>
          </div>
          
          <div className={styles.statDetailSection}>
            <div className={styles.statDetailTitle}>Lista de Participantes</div>
            <div className={styles.participantsList}>
              {event.participants.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                  Sin participantes aún
                </p>
              ) : (
                event.participants.map((participant, index) => (
                  <div key={index} className={styles.participantItem}>
                    <span className={styles.twitterHandle}>{participant.twitter}</span>
                    <span className={styles.walletAddress}>{participant.address}</span>
                    <small>
                      {new Date(participant.registeredAt).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 