'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { EventService, PaginatedEvent } from '@/services/eventService';
import { formatDuration } from '@/utils/time';
import styles from '../styles.module.css';

const EVENTS_PER_PAGE = 5;

export default function EventsTab() {
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
        Conecta tu wallet para ver tus eventos.
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
        No tienes eventos creados aún.
      </div>
    );
  }

  return (
    <div className={styles.eventsContainer}>
      <div className={styles.eventsList}>
        {events.map(event => (
          <div key={event.code} className={styles.eventCard}>
            <h3>{event.name}</h3>
            <p><strong>Código:</strong> {event.code}</p>
            <p><strong>Duración:</strong> {formatDuration(event.duration)}</p>
            <p><strong>Hashtags:</strong> {event.hashtags.join(', ')}</p>
            <p><strong>Participantes:</strong> {Number(event.participantCount)}</p>
            <p><strong>Estado:</strong> {event.closed ? 'Cerrado' : 'Abierto'}</p>
            <p><strong>POAP ID:</strong> {event.poapId}</p>
          </div>
        ))}
      </div>

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