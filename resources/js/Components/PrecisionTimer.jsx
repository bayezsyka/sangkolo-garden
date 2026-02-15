import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * PrecisionTimer — Real-time Precision Stopwatch
 *
 * Digital stopwatch that ticks every second, showing elapsed time
 * since `startTime` in HH:MM:SS or DD:HH:MM:SS format.
 *
 * @param {string}  startTime    - ISO datetime when the current phase started.
 * @param {string}  serverTime   - ISO datetime of server's current time (for sync offset).
 * @param {string}  phaseName    - Human-readable phase name (e.g., "Perendaman").
 * @param {string}  tanggalTanam - ISO datetime of the batch's initial planting date.
 * @param {boolean} showTotalAge - Whether to show the "Total Usia Tanam" footer.
 */
export default function PrecisionTimer({
    startTime,
    serverTime,
    phaseName = '',
    tanggalTanam,
    showTotalAge = true,
}) {
    // Calculate server-client offset once on mount
    const offsetRef = useRef(0);
    useEffect(() => {
        if (serverTime) {
            offsetRef.current = new Date(serverTime).getTime() - Date.now();
        }
    }, [serverTime]);

    const getNow = useCallback(() => {
        return Date.now() + offsetRef.current;
    }, []);

    // Format elapsed milliseconds into digital display
    const formatElapsed = useCallback((diffMs) => {
        if (diffMs < 0) return '00:00:00';

        const totalSeconds = Math.floor(diffMs / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);

        const pad = (n) => String(n).padStart(2, '0');

        if (days > 0) {
            return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }, []);

    // Phase elapsed
    const [phaseDisplay, setPhaseDisplay] = useState('00:00:00');
    // Total age elapsed
    const [ageDisplay, setAgeDisplay] = useState('00:00:00');

    useEffect(() => {
        if (!startTime) return;

        const startMs = new Date(startTime).getTime();
        const plantMs = tanggalTanam ? new Date(tanggalTanam).getTime() : null;

        const tick = () => {
            const now = getNow();
            setPhaseDisplay(formatElapsed(now - startMs));
            if (plantMs) {
                setAgeDisplay(formatElapsed(now - plantMs));
            }
        };

        tick(); // Immediate first tick
        const interval = setInterval(tick, 1000); // Every 1 second
        return () => clearInterval(interval);
    }, [startTime, tanggalTanam, getNow, formatElapsed]);

    // Format a date string for the "Mulai:" subtext
    const formatStartDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${date}, ${time}`;
    };

    if (!startTime) return null;

    return (
        <div className="precision-timer-widget">
            {/* ═══ SECTION A: STOPWATCH FASE — FOKUS UTAMA ═══ */}
            <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-700/50">
                {/* Header Label */}
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {phaseName ? `Durasi ${phaseName}` : 'Durasi Fase'}
                    </span>
                    {/* Live indicator dot */}
                    <span className="ml-auto flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[8px] text-emerald-400/70 uppercase tracking-wider font-medium">Live</span>
                    </span>
                </div>

                {/* Digital Timer Display */}
                <div className="bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/30">
                    <p className="font-mono text-2xl font-bold text-emerald-400 tracking-widest text-center tabular-nums leading-none">
                        {phaseDisplay}
                    </p>
                </div>

                {/* Subtext: Phase start datetime */}
                <p className="text-[9px] text-slate-500 mt-2 flex items-center gap-1 justify-center">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    Mulai: {formatStartDate(startTime)}
                </p>
            </div>

            {/* ═══ SECTION B: TOTAL USIA TANAM — INFO SEKUNDER ═══ */}
            {showTotalAge && tanggalTanam && (
                <div className="flex items-center justify-between mt-2 px-1.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        Total Usia Tanam
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-500 tabular-nums tracking-wider">
                        {ageDisplay}
                    </span>
                </div>
            )}
        </div>
    );
}
