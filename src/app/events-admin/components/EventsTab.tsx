'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { EventService, PaginatedEvent } from '@/services/eventService';
import { formatDuration } from '@/utils/time';
import styles from '../styles.module.css';

const EVENTS_PER_PAGE = 5;

export default function EventsTab() {
  const { address } = useAccount();
  const router = useRouter();
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

  // Función para generar link de reclamo de POAP
  const handlePoapClaimLink = (eventCode: string) => {
    // Redirigir a una página específica para el evento
    router.push(`/claim/${eventCode}`);
  };

  // Función para copiar link al portapapeles
  const handleCopyPoapLink = (eventCode: string) => {
    const link = `${window.location.origin}/claim/${eventCode}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('¡Link copiado al portapapeles!');
    }).catch(() => {
      alert('Error al copiar el link');
    });
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
            
 {/* Botones para POAP */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {/* Botón principal - Link para reclamar POAPs */}
              <button
                onClick={() => handlePoapClaimLink(event.code)}
                disabled={Number(event.participantCount) === 0}
                className="flex-1 min-w-0 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-60 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 relative group"
                title={Number(event.participantCount) === 0 ? "Sin participantes registrados" : ""}
              >
                <span className="text-lg">🎫</span>
                <span className="text-sm sm:text-base">Link para reclamar POAPs</span>
                
                {/* Tooltip para botón deshabilitado */}
                {Number(event.participantCount) === 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Sin participantes registrados
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </button>
              
              {/* Botón secundario - Copiar link */}
              <button
                onClick={() => handleCopyPoapLink(event.code)}
                className="sm:w-auto bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 hover:border-purple-400 text-purple-700 hover:text-purple-800 font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                title="Copiar link para compartir"
              >
                <span className="text-lg">📋</span>
                <span className="text-sm sm:text-base">Copiar Link</span>
              </button>
            </div>
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