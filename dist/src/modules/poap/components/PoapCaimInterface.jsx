"use client";
import React, { useState } from 'react';
import { StatusMessage } from './StatusMessage';
import { usePoapStore } from '../store/poapStore';
import { PoapIcon } from './PoapIcon';
import { DebugPanel } from './DebugPanel';
export function PoapClaimInterface() {
    const [walletAddress, setWalletAddress] = useState('');
    // Zustand store
    const { 
    // State
    isLoading, message, isError, claimStatus, 
    // Computed values
    availableCount, totalCount, 
    // Actions
    setMessage, clearMessage, 
    // POAP operations
    getWalletAssignedLink, checkIfWalletAlreadyClaimed, isWalletWhitelisted, claimPOAP, resetPOAPs, 
    // Data for debugging
    mintLinks } = usePoapStore();
    const handleSubmit = async () => {
        if (!walletAddress.trim()) {
            setMessage('Por favor ingresa tu dirección de wallet', true);
            return;
        }
        // Validar formato básico de wallet Ethereum
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            setMessage('Formato de wallet inválido', true);
            return;
        }
        clearMessage();
        // Verificar si la wallet está en la whitelist
        if (!isWalletWhitelisted(walletAddress)) {
            setMessage('No Completaste Correctamente el POST de Twitter', true);
            return;
        }
        // Verificar si ya reclamó - si sí, devolver su link asignado
        if (checkIfWalletAlreadyClaimed(walletAddress)) {
            const assignedLink = getWalletAssignedLink(walletAddress);
            if (assignedLink) {
                setMessage('Ya tienes un POAP asignado. Redirigiendo a tu link...', false);
                setTimeout(() => {
                    window.open(assignedLink.url, '_blank');
                }, 1500);
                return;
            }
        }
        // Intentar reclamar mint link
        const result = await claimPOAP(walletAddress);
        if (result.success) {
            if (result.isExisting) {
                setMessage('Recuperando tu POAP asignado. Redirigiendo...', false);
            }
            else {
                setMessage('¡POAP reclamado exitosamente! Redirigiendo...', false);
            }
            // Redirigir después de un momento
            setTimeout(() => {
                if (result.link) {
                    window.open(result.link.url, '_blank');
                }
            }, 1500);
        }
        else {
            setMessage(result.error || 'Error desconocido', true);
        }
    };
    // Manejar Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-300/20">
        {/* Header */}
        <div className="text-center mb-8">
          <PoapIcon />
          <h1 className="text-3xl font-bold text-white mb-2">Reclamar POAP</h1>
          <p className="text-purple-200">Ingresa tu wallet para verificar elegibilidad</p>
          
          {/* Contador de disponibilidad */}
          <div className="mt-4 bg-purple-800/40 rounded-lg p-3">
            <p className="text-purple-200 text-sm">
              POAPs disponibles: <span className="font-bold text-white">{availableCount()}/{totalCount()}</span>
            </p>
            {availableCount() === 0 && (<p className="text-red-300 text-xs mt-1">¡Todos los POAPs han sido reclamados!</p>)}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label htmlFor="wallet" className="block text-sm font-medium text-purple-200 mb-2">
              Dirección de Wallet
            </label>
            <input type="text" id="wallet" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} onKeyPress={handleKeyPress} placeholder="0x..." disabled={isLoading} className="w-full px-4 py-3 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm disabled:opacity-50 transition-all duration-200"/>
          </div>

          <button onClick={handleSubmit} disabled={isLoading || availableCount() === 0} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:hover:scale-100 disabled:cursor-not-allowed">
            {isLoading ? (<div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>) : availableCount() === 0 ? ('No hay POAPs disponibles') : ('Verificar y Reclamar POAP')}
          </button>
        </div>

        {/* Status Messages */}
        <StatusMessage claimStatus={claimStatus} message={message} isError={isError}/>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-purple-300 text-sm">
            Asegúrate de haber completado correctamente el POST de Twitter
          </p>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-purple-800/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">¿Qué es un POAP?</h3>
          <p className="text-purple-200 text-sm">
            Los POAPs (Proof of Attendance Protocol) son tokens NFT únicos que demuestran tu participación en eventos especiales.
          </p>
        </div>

        {/* Debug Panel - Solo en desarrollo */}
        <DebugPanel resetPOAPs={resetPOAPs} mintLinks={mintLinks}/>
      </div>
    </div>);
}
