import React from 'react';
export function StatusMessage({ claimStatus, message, isError }) {
    return (<>
      {claimStatus && (<div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
          <p className="text-yellow-200 text-center text-sm">{claimStatus}</p>
        </div>)}

      {message && (<div className={`mt-6 p-4 rounded-lg transition-all duration-300 ${isError
                ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                : 'bg-green-500/20 border border-green-400/30 text-green-200'}`}>
          <p className="text-center font-medium">{message}</p>
        </div>)}
    </>);
}
// src/modules/poap/components/DebugPanel.tsx
