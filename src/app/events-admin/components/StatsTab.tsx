'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { EventService, PaginatedEvent } from '@/services/eventService';
import { formatDuration } from '@/utils/time';
import styles from '../styles.module.css';

const EVENTS_PER_PAGE = 5;

export default function StatsTab() {
  const { address } = useAccount();
  const [events, setEvents] = useState<PaginatedEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = async (page: number) => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      setError('');
      const response = await EventService.getPaginatedEvents(page, EVENTS_PER_PAGE);
      setEvents(response.events);
      setTotalPages(Math.ceil(Number(response.totalEvents) / EVENTS_PER_PAGE));
    } catch (err) {
      setError('Error al cargar los eventos: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, address]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!address) {
    return (
      <div className={styles.noEventsMessage}>
        Conecta tu wallet para ver las estadísticas.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingMessage}>
        Cargando eventos...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        {error}
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
                  <span key={tag} className={styles.hashtagDisplay}>{tag}</span>
                ))}
              </div>
            </div>
            
            <div className={styles.statDetailSection}>
              <div className={styles.statDetailTitle}>Participantes Registrados</div>
              <div className={styles.participantsCount}>
                {Number(event.participantCount)}
              </div>
            </div>
          </div>
          
          <div className={styles.statDetailSection}>
            <div className={styles.statDetailTitle}>Detalles del Evento</div>
            <div className={styles.eventDetails}>
              <p><strong>Estado:</strong> {event.closed ? 'Cerrado' : 'Abierto'}</p>
              <p><strong>POAP ID:</strong> {event.poapId}</p>
              <p><strong>Duración:</strong> {formatDuration(event.duration)}</p>
              <p><strong>Creado por:</strong> {event.creator}</p>
            </div>
          </div>
        </div>
      ))}

      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.paginationButton}
        >
          Anterior
        </button>
        <span className={styles.pageInfo}>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
} 