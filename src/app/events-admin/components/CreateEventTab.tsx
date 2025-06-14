'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../styles.module.css';

interface Hashtag {
  id: string;
  text: string;
}

export default function CreateEventTab() {
  const { address } = useAccount();
  const [eventCode, setEventCode] = useState('');
  const [eventName, setEventName] = useState('');
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addHashtag = (tag: string) => {
    if (tag && !hashtags.some(h => h.text === tag)) {
      setHashtags([...hashtags, { id: Math.random().toString(), text: tag }]);
    }
  };

  const removeHashtag = (id: string) => {
    setHashtags(hashtags.filter(h => h.id !== id));
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = hashtagInput.trim().replace('#', '');
      if (tag) {
        addHashtag(tag);
        setHashtagInput('');
      }
    }
  };

  const calculateDuration = () => {
    const totalSeconds = (hours * 3600) + (minutes * 60);
    const hoursText = hours > 0 ? `${hours}h ` : '';
    const minutesText = minutes > 0 ? `${minutes}m` : '';
    return `${totalSeconds} segundos (${hoursText}${minutesText})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Por favor, conecta tu wallet primero');
      return;
    }

    if (!eventCode || !eventName) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    const duration = (hours * 3600) + (minutes * 60);
    if (duration <= 0) {
      setError('La duración del evento debe ser mayor a 0');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // TODO: Implement actual event creation logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      
      setSuccess(`Evento "${eventName}" creado exitosamente con código: ${eventCode}`);
      
      // Reset form
      setEventCode('');
      setEventName('');
      setHashtags([]);
      setHours(0);
      setMinutes(0);
      
    } catch (error) {
      setError('Error al crear el evento: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.formSection}>
        <label htmlFor="eventCode">Código del Evento *</label>
        <input
          type="text"
          id="eventCode"
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value)}
          required
          placeholder="Ingresa el código único del evento"
        />
      </div>

      <div className={styles.formSection}>
        <label htmlFor="eventName">Nombre del Evento *</label>
        <input
          type="text"
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
          placeholder="Nombre descriptivo del evento"
        />
      </div>

      <div className={styles.formSection}>
        <label>Hashtags del Evento</label>
        <div className={styles.hashtagsContainer}>
          {hashtags.map(hashtag => (
            <div key={hashtag.id} className={styles.hashtagTag}>
              #{hashtag.text}
              <button
                type="button"
                className={styles.hashtagRemove}
                onClick={() => removeHashtag(hashtag.id)}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            className={styles.hashtagInput}
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyPress={handleHashtagKeyPress}
            onBlur={() => {
              const tag = hashtagInput.trim().replace('#', '');
              if (tag) {
                addHashtag(tag);
                setHashtagInput('');
              }
            }}
            placeholder="Escribe un hashtag y presiona Enter"
          />
        </div>
        <small className={styles.helperText}>
          Presiona Enter o haz clic fuera del campo para agregar hashtags
        </small>
      </div>

      <div className={styles.formSection}>
        <label>Duración del Evento</label>
        <div className={styles.durationCalculator}>
          <div className={styles.durationInput}>
            <label>Horas</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
              min="0"
              max="999"
              placeholder="0"
            />
          </div>
          <div className={styles.durationInput}>
            <label>Minutos</label>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
              min="0"
              max="59"
              placeholder="0"
            />
          </div>
        </div>
        <div className={styles.durationResult}>
          Total: {calculateDuration()}
        </div>
      </div>

      <div className={styles.infoPanel}>
        <strong>📋 Información:</strong><br />
        • Todos los campos marcados con * son obligatorios<br />
        • Los hashtags se agregan automáticamente al presionar Enter<br />
        • La duración se calcula automáticamente en segundos<br />
        • Asegúrate de tener suficiente ETH para el gas de la transacción
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isLoading || !address}
      >
        {isLoading ? 'Creando...' : 'Crear Evento POAP'}
      </button>
    </form>
  );
} 