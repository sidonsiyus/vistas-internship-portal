import React from 'react';
import { QrCode } from 'lucide-react';

export default function QRCodeView({ tokenNumber, studentName, appointmentDate }) {
  // SVG Mock QR pattern generator for student pass
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="relative bg-white p-3 rounded-lg shadow-md mb-2">
        <svg className="w-32 h-32 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
          {/* Position detection patterns */}
          <rect x="5" y="5" width="25" height="25" fill="black" />
          <rect x="9" y="9" width="17" height="17" fill="white" />
          <rect x="13" y="13" width="9" height="9" fill="black" />

          <rect x="70" y="5" width="25" height="25" fill="black" />
          <rect x="74" y="9" width="17" height="17" fill="white" />
          <rect x="78" y="13" width="9" height="9" fill="black" />

          <rect x="5" y="70" width="25" height="25" fill="black" />
          <rect x="9" y="74" width="17" height="17" fill="white" />
          <rect x="13" y="78" width="9" height="9" fill="black" />

          {/* Synthetic QR matrix data based on token */}
          <rect x="35" y="10" width="6" height="6" fill="black" />
          <rect x="45" y="10" width="6" height="6" fill="black" />
          <rect x="55" y="15" width="8" height="8" fill="black" />

          <rect x="10" y="35" width="8" height="8" fill="black" />
          <rect x="25" y="40" width="6" height="6" fill="black" />
          <rect x="40" y="35" width="12" height="12" fill="black" />
          <rect x="60" y="38" width="10" height="10" fill="black" />
          <rect x="75" y="35" width="12" height="6" fill="black" />

          <rect x="38" y="55" width="8" height="8" fill="black" />
          <rect x="52" y="52" width="12" height="12" fill="black" />
          <rect x="70" y="55" width="6" height="10" fill="black" />

          <rect x="35" y="72" width="10" height="10" fill="black" />
          <rect x="50" y="78" width="14" height="6" fill="black" />
          <rect x="72" y="72" width="15" height="15" fill="black" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-600 text-white p-1 rounded-md shadow">
            <QrCode className="w-4 h-4" />
          </div>
        </div>
      </div>
      <p className="text-xs font-mono font-semibold text-blue-400">SCAN AT COORDINATOR DESK</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{tokenNumber} • VISTAS PASS</p>
    </div>
  );
}
