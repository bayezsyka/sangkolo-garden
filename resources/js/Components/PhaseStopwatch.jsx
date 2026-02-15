import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * PhaseStopwatch — Minimalist Industrial Phase Timer
 *
 * Clean monospace stopwatch displaying elapsed time since phase start.
 * Format: HH:MM:SS or DD:HH:MM:SS (if > 24h).
 * Ticks every second. No flashy colors — pure instrument aesthetic.
 *
 * @param {string} startTime  - ISO datetime when the current phase started.
 * @param {string} serverTime - ISO datetime of server's current time (for sync).
 * @param {string} phaseName  - Human-readable phase name (e.g., "Perendaman").
 */
export default function PhaseStopwatch({ startTime, serverTime, phaseName = '', onClick }) {
    const offsetRef = useRef(0);

    useEffect(() => {
        if (serverTime) {
            offsetRef.current = new Date(serverTime).getTime() - Date.now();
        }
    }, [serverTime]);

    const format = useCallback((diffMs) => {
        if (!diffMs || diffMs < 0) return '00:00:00';

        const totalSec = Math.floor(diffMs / 1000);
        const s = totalSec % 60;
        const totalMin = Math.floor(totalSec / 60);
        const m = totalMin % 60;
        const totalHr = Math.floor(totalMin / 60);
        const h = totalHr % 24;
        const d = Math.floor(totalHr / 24);

        const pad = (n) => String(n).padStart(2, '0');

        return d > 0
            ? `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`
            : `${pad(h)}:${pad(m)}:${pad(s)}`;
    }, []);

    const [display, setDisplay] = useState('00:00:00');

    useEffect(() => {
        if (!startTime) return;

        const startMs = new Date(startTime).getTime();

        const tick = () => {
            const now = Date.now() + offsetRef.current;
            setDisplay(format(now - startMs));
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startTime, format]);

    if (!startTime) return null;

    return (
        <div 
            onClick={onClick}
            className={`flex items-center gap-2 py-1.5 ${onClick ? 'cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded transition-colors' : ''}`}
        >
            {/* Clock icon — small, muted */}
            <svg
                className="w-3.5 h-3.5 text-slate-300 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>

            {/* Phase name */}
            <span className="text-[10px] text-slate-400 leading-none whitespace-nowrap">
                {phaseName || 'Fase'}
            </span>

            {/* Spacer */}
            <span className="flex-1" />

            {/* Digital display */}
            <span className="font-mono text-xs font-semibold text-slate-600 tracking-widest tabular-nums leading-none">
                {display}
            </span>
        </div>
    );
}
