"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');

  // Array de wallets habilitadas - Reemplaza con tus wallets reales
  const whitelistedWallets = [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0x9876543210987654321098765432109876543210',
    '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba',
    '0x1111222211112222111122221111222211112222',
    '0x3333444433334444333344443333444433334444',
    '0x5555666655556666555566665555666655556666',
    '0x7777888877778888777788887777888877778888',
    '0x9999aaaa9999aaaa9999aaaa9999aaaa9999aaaa',
    "0x77B7f7E65BDcF87958B99a1Adb1ADBa6F388f2aa"
  ];

  // Estado de mint links con localStorage
  const [mintLinksState, setMintLinksState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mintLinksState');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    
    return {
      available: [
        { id: 'nq1ez5', url: 'https://poap.xyz/mint/nq1ez5', claimed: false, claimedBy: null },
        { id: 'slr6qp', url: 'https://poap.xyz/mint/slr6qp', claimed: false, claimedBy: null },
        { id: 'a7ky2s', url: 'https://poap.xyz/mint/a7ky2s', claimed: false, claimedBy: null },
        { id: '8eme57', url: 'https://poap.xyz/mint/8eme57', claimed: false, claimedBy: null },
        { id: 'oouh5j', url: 'https://poap.xyz/mint/oouh5j', claimed: false, claimedBy: null },
        { id: 'pzn97u', url: 'https://poap.xyz/mint/pzn97u', claimed: false, claimedBy: null },
        { id: 'yizp36', url: 'https://poap.xyz/mint/yizp36', claimed: false, claimedBy: null },
        { id: 'f48xpe', url: 'https://poap.xyz/mint/f48xpe', claimed: false, claimedBy: null },
        { id: '8wa9ea', url: 'https://poap.xyz/mint/8wa9ea', claimed: false, claimedBy: null }
      ]
    };
  });

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mintLinksState', JSON.stringify(mintLinksState));
    }
  }, [mintLinksState]);

  // Verificar si la wallet ya reclamó y obtener su link asignado
  const getWalletAssignedLink = (wallet: string) => {
    const assignedLink = mintLinksState.available.find((link: any) => 
      link.claimedBy === wallet.toLowerCase()
    );
    return assignedLink || null;
  };

  // Verificar si la wallet ya reclamó
  const checkIfWalletAlreadyClaimed = (wallet: string) => {
    return mintLinksState.available.some((link: any) => link.claimedBy === wallet.toLowerCase());
  };

  // Simular el proceso de claim con delay
  const claimMintLink = async (wallet: string) => {
    setIsLoading(true);
    setClaimStatus('Verificando disponibilidad...');
    
    // Simular delay de red/procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Verificar si la wallet ya reclamó (doble verificación por concurrencia)
    if (checkIfWalletAlreadyClaimed(wallet)) {
      const assignedLink = getWalletAssignedLink(wallet);
      if (assignedLink) {
        return { success: true, link: assignedLink, isExisting: true };
      }
      return { success: false, error: 'Esta wallet ya reclamó un POAP' };
    }
    
    // Buscar primer mint link disponible
    const availableLinks = mintLinksState.available.filter((link: any) => !link.claimed);
    
    if (availableLinks.length === 0) {
      return { success: false, error: 'No hay más POAPs disponibles' };
    }
    
    // Tomar el primero disponible (FIFO)
    const selectedLink = availableLinks[0];
    
    setClaimStatus('Asignando POAP...');
    
    // Simular otro pequeño delay para el procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Actualizar estado - marcar como reclamado
    setMintLinksState((prevState: any) => ({
      available: prevState.available.map((link: any) => 
        link.id === selectedLink.id 
          ? { ...link, claimed: true, claimedBy: wallet.toLowerCase() }
          : link
      )
    }));
    
    return { success: true, link: selectedLink, isExisting: false };
  };

  const handleSubmit = async () => {
    if (!walletAddress.trim()) {
      setMessage('Por favor ingresa tu dirección de wallet');
      setIsError(true);
      return;
    }

    // Validar formato básico de wallet Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setMessage('Formato de wallet inválido');
      setIsError(true);
      return;
    }

    setMessage('');
    setIsError(false);
    
    // Verificar si la wallet está en la whitelist
    const isWhitelisted = whitelistedWallets.includes(walletAddress);
    
    if (!isWhitelisted) {
      setMessage('No Completaste Correctamente el POST de Twitter');
      setIsError(true);
      return;
    }

    // Verificar si ya reclamó - si sí, devolver su link asignado
    if (checkIfWalletAlreadyClaimed(walletAddress)) {
      const assignedLink = getWalletAssignedLink(walletAddress);
      if (assignedLink) {
        setMessage('Ya tienes un POAP asignado. Redirigiendo a tu link...');
        setIsError(false);
        
        setTimeout(() => {
          window.open(assignedLink.url, '_blank');
        }, 1500);
        return;
      }
    }

    // Intentar reclamar mint link
    const result = await claimMintLink(walletAddress);
    setIsLoading(false);
    setClaimStatus('');
    
    if (result.success) {
      if (result.isExisting) {
        setMessage('Recuperando tu POAP asignado. Redirigiendo...');
      } else {
        setMessage('¡POAP reclamado exitosamente! Redirigiendo...');
      }
      setIsError(false);
      
      // Redirigir después de un momento
      setTimeout(() => {
        window.open(result.link.url, '_blank');
      }, 1500);
    } else {
      setMessage(result.error!);
      setIsError(true);
    }
  };

  // Manejar Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const availableCount = mintLinksState.available.filter((link: any) => !link.claimed).length;
  const totalCount = mintLinksState.available.length;

  // Función para resetear (solo para desarrollo/testing)
  const resetPOAPs = () => {
    setMintLinksState({
      available: [
        { id: 'nq1ez5', url: 'https://poap.xyz/mint/nq1ez5', claimed: false, claimedBy: null },
        { id: 'slr6qp', url: 'https://poap.xyz/mint/slr6qp', claimed: false, claimedBy: null },
        { id: 'a7ky2s', url: 'https://poap.xyz/mint/a7ky2s', claimed: false, claimedBy: null },
        { id: '8eme57', url: 'https://poap.xyz/mint/8eme57', claimed: false, claimedBy: null },
        { id: 'oouh5j', url: 'https://poap.xyz/mint/oouh5j', claimed: false, claimedBy: null },
        { id: 'pzn97u', url: 'https://poap.xyz/mint/pzn97u', claimed: false, claimedBy: null },
        { id: 'yizp36', url: 'https://poap.xyz/mint/yizp36', claimed: false, claimedBy: null },
        { id: 'f48xpe', url: 'https://poap.xyz/mint/f48xpe', claimed: false, claimedBy: null },
        { id: '8wa9ea', url: 'https://poap.xyz/mint/8wa9ea', claimed: false, claimedBy: null }
      ]
    });
    setMessage('POAPs reseteados para testing');
    setIsError(false);
  };

  return (
    <>
      <Head>
        <title>Reclamar POAP</title>
        <meta name="description" content="Reclama tu POAP después de completar el POST de Twitter" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-300/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reclamar POAP</h1>
            <p className="text-purple-200">Ingresa tu wallet para verificar elegibilidad</p>
            
            {/* Contador de disponibilidad */}
            <div className="mt-4 bg-purple-800/40 rounded-lg p-3">
              <p className="text-purple-200 text-sm">
                POAPs disponibles: <span className="font-bold text-white">{availableCount}/{totalCount}</span>
              </p>
              {availableCount === 0 && (
                <p className="text-red-300 text-xs mt-1">¡Todos los POAPs han sido reclamados!</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-purple-200 mb-2">
                Dirección de Wallet
              </label>
              <input
                type="text"
                id="wallet"
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
              disabled={isLoading || availableCount === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : availableCount === 0 ? (
                'No hay POAPs disponibles'
              ) : (
                'Verificar y Reclamar POAP'
              )}
            </button>
          </div>

          {claimStatus && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
              <p className="text-yellow-200 text-center text-sm">{claimStatus}</p>
            </div>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-lg transition-all duration-300 ${isError 
              ? 'bg-red-500/20 border border-red-400/30 text-red-200' 
              : 'bg-green-500/20 border border-green-400/30 text-green-200'
            }`}>
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

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

          {/* Botón para resetear - Solo para desarrollo/testing */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={resetPOAPs}
              className="mt-4 w-full text-purple-300 text-xs hover:text-purple-200 transition-colors border border-purple-400/30 rounded-lg py-2 px-3 hover:bg-purple-800/20"
            >
              🔄 Resetear POAPs (Solo para testing)
            </button>
          )}

          {/* Lista de wallets reclamadas - Solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 bg-purple-900/30 rounded-lg p-3">
              <h4 className="text-purple-200 text-xs font-semibold mb-2">Debug - Wallets que han reclamado:</h4>
              <div className="space-y-1">
                {mintLinksState.available
                  .filter((link: any) => link.claimed)
                  .map((link: any) => (
                    <p key={link.id} className="text-purple-300 text-xs break-all">
                      {link.claimedBy} → {link.id}
                    </p>
                  ))
                }
                {mintLinksState.available.filter((link: any) => link.claimed).length === 0 && (
                  <p className="text-purple-400 text-xs">Ninguna wallet ha reclamado aún</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}