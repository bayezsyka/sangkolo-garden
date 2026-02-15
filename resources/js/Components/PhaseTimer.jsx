import { useState, useEffect, useCallback } from 'react';

/**
 * PhaseTimer — Phase Stopwatch Engine
 *
 * A self-contained stopwatch component that displays the real-time elapsed
 * duration of the current plant phase. Updates every 60 seconds.
 *
 * @param {string}  startDate   - ISO datetime string for when the current phase started.
 * @param {string}  phaseName   - Human-readable phase name (e.g., "Perendaman", "Produksi").
 * @param {string}  serverTime  - ISO datetime string of the server's current time (sync offset).
 * @param {string}  tanggalTanam - ISO datetime string of the batch's initial planting date.
 * @param {boolean} showTotalAge - Whether to show the "Total Usia Tanam" footer section.
 */
export default function PhaseTimer({
    startDate,
    phaseName = '',
    serverTime,
    tanggalTanam,
    showTotalAge = true,
}) {
    // Calculate server-client offset once
    const serverOffset = useCallback(() => {
        if (!serverTime) return 0;
        return new Date(serverTime).getTime() - Date.now();
    }, [serverTime]);

    const calculateElapsed = useCallback((from) => {
        if (!from) return null;

        const start = new Date(from);
        const now = new Date(Date.now() + serverOffset());
        const diffMs = now.getTime() - start.getTime();

        if (diffMs < 0) return { text: 'Baru saja', totalMinutes: 0, totalDays: 0 };

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        const minutes = totalMinutes % 60;
        const hours = totalHours % 24;

        let text = '';
        if (totalDays > 0) {
            text = `${totalDays} Hari ${hours} Jam`;
        } else if (totalHours > 0) {
            text = `${totalHours} Jam ${minutes} Menit`;
        } else if (totalMinutes > 0) {
            text = `${totalMinutes} Menit`;
        } else {
            text = 'Baru saja';
        }

        return { text, totalMinutes, totalHours, totalDays };
    }, [serverOffset]);

    const [phaseDuration, setPhaseDuration] = useState(() => calculateElapsed(startDate));
    const [totalAge, setTotalAge] = useState(() => calculateElapsed(tanggalTanam));

    useEffect(() => {
        const tick = () => {
            setPhaseDuration(calculateElapsed(startDate));
            if (tanggalTanam) setTotalAge(calculateElapsed(tanggalTanam));
        };

        tick(); // Immediate first tick
        const interval = setInterval(tick, 60000); // Every 60 seconds
        return () => clearInterval(interval);
    }, [startDate, tanggalTanam, calculateElapsed]);

    if (!phaseDuration) return null;

    const formatStartDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return `${date}, ${time}`;
    };

    const calculateTotalDays = (dateStr) => {
        if (!dateStr) return 0;
        const start = new Date(dateStr);
        const now = new Date(Date.now() + serverOffset());
        return Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    };

    return (
        <div className="phase-timer-widget">
            {/* ═══ SECTION A: FOKUS UTAMA — STOPWATCH FASE ═══ */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                <div className="flex items-center gap-2 mb-2">
                    {/* Stopwatch Icon */}
                    <div className="w-6 h-6 bg-slate-200/70 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                        {phaseName ? `Durasi ${phaseName}` : 'Durasi Fase'}
                    </span>
                </div>

                {/* Timer Value — Bold & Eye-catching */}
                <p className="text-base font-extrabold text-slate-800 tracking-tight leading-tight ml-0.5">
                    {phaseDuration.text}
                </p>

                {/* Subtext: Phase start datetime  */}
                <p className="text-[9px] text-slate-400 mt-1.5 ml-0.5 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    Mulai: {formatStartDate(startDate)}
                </p>
            </div>

            {/* ═══ SECTION B: INFO SEKUNDER — TOTAL UMUR ═══ */}
            {showTotalAge && tanggalTanam && (
                <div className="flex items-center justify-between mt-2 px-1">
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        Total Usia Tanam
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                        {calculateTotalDays(tanggalTanam)} Hari
                    </span>
                </div>
            )}
        </div>
    );
}
