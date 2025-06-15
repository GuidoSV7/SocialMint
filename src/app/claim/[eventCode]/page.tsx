"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePoapStore } from '../../../modules/poap/store/poapStore';
import { EventService, EventData } from '@/services/eventService';

export default function EventPoapClaim() {
  const params = useParams();
  const eventCode = params.eventCode as string;
  
  const [walletAddress, setWalletAddress] = useState('');
  const [currentEvent, setCurrentEvent] = useState<EventData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  // Tu store original de POAPs
  const {
    isLoading: poapLoading,
    message,
    isError,
    claimStatus,
    availableCount,
    totalCount,
    setMessage,
    clearMessage,
    getWalletAssignedLink,
    checkIfWalletAlreadyClaimed,
    claimPOAP
  } = usePoapStore();

  const isLoading = poapLoading || isLoadingEvent;

  // Cargar evento al montar usando EventService
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventCode) return;
      
      setIsLoadingEvent(true);
      try {
        console.log('🔍 Cargando evento con EventService:', eventCode);
        const eventData = await EventService.getEvent(eventCode);
        console.log('✅ Evento cargado:', eventData);
        setCurrentEvent(eventData);
      } catch (error: any) {
        console.error('❌ Error cargando evento:', error);
        if (error.code === 'EVENT_NOT_FOUND') {
          setMessage(`Evento "${eventCode}" no encontrado`, true);
        } else {
          setMessage('Error al cargar el evento', true);
        }
      } finally {
        setIsLoadingEvent(false);
      }
    };

    loadEvent();
  }, [eventCode, setMessage]);

  // Función para verificar participación usando EventService
  const checkUserParticipation = async (eventCode: string, walletAddress: string): Promise<boolean> => {
    try {
      const eventData = await EventService.getEvent(eventCode);
      const hasParticipated = eventData.participantsAddress.some(participant => 
        participant.toLowerCase() === walletAddress.toLowerCase()
      );
      
      console.log('🔍 Verificación de participación:', {
        eventCode,
        walletAddress,
        hasParticipated,
        totalParticipants: eventData.participantsAddress.length
      });
      
      return hasParticipated;
    } catch (error) {
      console.error('❌ Error verificando participación:', error);
      return false;
    }
  };

  // Función para obtener participantes usando EventService
  const getEventParticipants = async (eventCode: string): Promise<string[]> => {
    try {
      const eventData = await EventService.getEvent(eventCode);
      return eventData.participantsAddress;
    } catch (error) {
      console.error('❌ Error obteniendo participantes:', error);
      return [];
    }
  };

  const handleSubmit = async () => {
    if (!walletAddress.trim()) {
      setMessage('Por favor ingresa tu dirección de wallet', true);
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setMessage('Formato de wallet inválido', true);
      return;
    }

    if (!currentEvent) {
      setMessage('Evento no disponible', true);
      return;
    }

    if (currentEvent.closed) {
      setMessage('El evento ya ha finalizado', true);
      return;
    }

    clearMessage();

    try {
      // 1. Verificar participación usando EventService
      setMessage('Verificando tu participación...', false);
      const hasParticipated = await checkUserParticipation(eventCode, walletAddress);
      
      if (!hasParticipated) {
        setMessage('No participaste en este evento. Solo los participantes verificados pueden reclamar POAPs.', true);
        return;
      }

      // 2. Obtener participantes y verificar que la wallet esté incluida
      setMessage('Verificando elegibilidad...', false);
      const participants = await getEventParticipants(eventCode);

      console.log('🔍 WALLETS VERIFICADAS EN EL EVENTO:', {
  eventCode,
  participants,
  totalParticipants: participants.length,
  walletAddresses: participants
});
      
      const isEligible = participants.some(p => 
        p.toLowerCase() === walletAddress.toLowerCase()
      );
      
      if (!isEligible) {
        setMessage('Tu wallet no está en la lista de participantes del evento', true);
        return;
      }

      // 3. Actualizar whitelist temporal en el store POAP
      usePoapStore.setState((state) => ({
        whitelistedWallets: [
          ...new Set([...state.whitelistedWallets, ...participants])
        ]
      }));

      // 4. Verificar si ya reclamó
      if (checkIfWalletAlreadyClaimed(walletAddress)) {
        const assignedLink = getWalletAssignedLink(walletAddress);
        if (assignedLink) {
          setMessage('Ya tienes un POAP asignado. Redirigiendo...', false);
          setTimeout(() => {
            window.open(assignedLink.url, '_blank');
          }, 1500);
          return;
        }
      }

      // 5. Reclamar POAP
      setMessage('Reclamando tu POAP...', false);
      const result = await claimPOAP(walletAddress);
      
      if (result.success) {
        if (result.isExisting) {
          setMessage('Recuperando tu POAP asignado. Redirigiendo...', false);
        } else {
          setMessage('¡POAP reclamado exitosamente! Redirigiendo...', false);
        }
        
        setTimeout(() => {
          if (result.link) {
            window.open(result.link.url, '_blank');
          }
        }, 1500);
      } else {
        setMessage(result.error || 'Error desconocido', true);
      }

    } catch (error: any) {
      console.error('Error:', error);
      setMessage(`Error: ${error.message}`, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-300/20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-3xl font-bold text-white mb-2">Reclamar POAP</h1>
          <p className="text-purple-200 text-sm mb-4">
            Evento: <code className="bg-purple-700/50 px-2 py-1 rounded">{eventCode}</code>
          </p>
          
          {/* Detalles del evento */}
          {currentEvent ? (
            <div className="bg-purple-800/40 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">{currentEvent.name}</h2>
              <div className="text-purple-200 text-sm space-y-1">
                <p><strong>Participantes:</strong> {currentEvent.registeredQuantity.toString()}</p>
                <p>
                  <strong>Estado:</strong> 
                  <span className={`ml-1 ${currentEvent.closed ? 'text-red-300' : 'text-green-300'}`}>
                    {currentEvent.closed ? '🔴 Finalizado' : '🟢 Activo'}
                  </span>
                </p>
                <p><strong>POAP ID:</strong> {currentEvent.poadId}</p>
              </div>
              
              {/* Hashtags */}
              {currentEvent.tags && currentEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {currentEvent.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-purple-600/50 text-purple-200 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : isLoadingEvent ? (
            <div className="bg-purple-800/40 rounded-lg p-4 mb-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-purple-600/50 rounded"></div>
                <div className="h-3 bg-purple-600/30 rounded w-3/4"></div>
                <div className="h-3 bg-purple-600/30 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="bg-red-800/40 rounded-lg p-4 mb-4">
              <p className="text-red-200">⚠️ Evento no encontrado</p>
            </div>
          )}
          
          <p className="text-purple-200 text-sm">
            Solo participantes verificados en blockchain
          </p>
          
          {/* Contador de POAPs disponibles */}
          <div className="mt-4 bg-purple-800/40 rounded-lg p-3">
            <p className="text-purple-200 text-sm">
              POAPs disponibles: 
              <span className="font-bold text-white ml-1">
                {availableCount()}/{totalCount()}
              </span>
            </p>
            {availableCount() === 0 && (
              <p className="text-red-300 text-xs mt-1">
                ¡Todos los POAPs han sido reclamados!
              </p>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Dirección de Wallet
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="0x..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm disabled:opacity-50 transition-all duration-200"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              isLoading || 
              !walletAddress.trim() || 
              !currentEvent ||
              availableCount() === 0 || 
              (currentEvent && currentEvent.closed)
            }
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                <span className="text-sm">
                  {claimStatus || 'Procesando...'}
                </span>
              </div>
            ) : !currentEvent ? (
              'Evento no disponible'
            ) : currentEvent.closed ? (
              'Evento finalizado'
            ) : availableCount() === 0 ? (
              'No hay POAPs disponibles'
            ) : (
              'Verificar y Reclamar POAP'
            )}
          </button>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg border ${
            isError 
              ? 'bg-red-100/10 text-red-200 border-red-400/30' 
              : 'bg-green-100/10 text-green-200 border-green-400/30'
          }`}>
            <div className="flex items-start gap-2">
              <span className="text-lg">
                {isError ? '⚠️' : '✅'}
              </span>
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Información del evento */}
        <div className="mt-6 bg-purple-800/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            Sobre este evento
          </h3>
          <p className="text-purple-200 text-sm leading-relaxed">
            Este POAP es exclusivo para participantes verificados en el evento 
            <code className="bg-purple-700/50 px-1 py-0.5 rounded text-purple-100 mx-1">
              {eventCode}
            </code>
            Tu participación se verifica automáticamente desde la blockchain.
          </p>
        </div>

      
      </div>
    </div>
  );
}