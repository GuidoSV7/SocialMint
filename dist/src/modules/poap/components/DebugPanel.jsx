import React from 'react';
export function DebugPanel({ resetPOAPs, mintLinks }) {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    return (<>
      {/* Botón para resetear - Solo para desarrollo/testing */}
      <button onClick={resetPOAPs} className="mt-4 w-full text-purple-300 text-xs hover:text-purple-200 transition-colors border border-purple-400/30 rounded-lg py-2 px-3 hover:bg-purple-800/20">
        🔄 Resetear POAPs (Solo para testing)
      </button>

      {/* Lista de wallets reclamadas - Solo en desarrollo */}
      <div className="mt-4 bg-purple-900/30 rounded-lg p-3">
        <h4 className="text-purple-200 text-xs font-semibold mb-2">Debug - Wallets que han reclamado:</h4>
        <div className="space-y-1">
          {mintLinks
            .filter((link) => link.claimed)
            .map((link) => (<p key={link.id} className="text-purple-300 text-xs break-all">
                {link.claimedBy} → {link.id}
              </p>))}
          {mintLinks.filter((link) => link.claimed).length === 0 && (<p className="text-purple-400 text-xs">Ninguna wallet ha reclamado aún</p>)}
        </div>
      </div>
    </>);
}
