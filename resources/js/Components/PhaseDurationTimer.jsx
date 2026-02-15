import { useState, useEffect, useCallback } from 'react';

/**
 * PhaseDurationTimer — Passive Chronometer
 * 
 * Displays the elapsed time since `startDate` in a human-readable format.
 * Updates every 30 seconds. No manual input needed.
 * 
 * @param {string} startDate - ISO datetime string for when the current phase started.
 * @param {string} serverTime - ISO datetime string of the server's current time (for sync).
 * @param {string} className - Optional additional CSS classes.
 * @param {boolean} compact - If true, uses a shorter format.
 */
export default function PhaseDurationTimer({ startDate, serverTime, className = '', compact = false }) {
    const calculateDuration = useCallback(() => {
        if (!startDate) return null;

        const start = new Date(startDate);
        
        // Calculate offset between server time and client time for accuracy
        let now = new Date();
        if (serverTime) {
            const server = new Date(serverTime);
            const offset = server.getTime() - new Date().getTime();
            now = new Date(now.getTime() + offset);
        }
        
        const diffMs = now.getTime() - start.getTime();
        if (diffMs < 0) return { text: 'Baru saja', totalMinutes: 0 };

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        const minutes = totalMinutes % 60;
        const hours = totalHours % 24;
        const days = totalDays;

        let text = '';
        
        if (compact) {
            if (days > 0) {
                text = `${days}h ${hours}j`;
            } else if (hours > 0) {
                text = `${hours}j ${minutes}m`;
            } else {
                text = `${minutes}m`;
            }
        } else {
            if (days > 0) {
                text = `${days} Hari ${hours} Jam`;
            } else if (hours > 0) {
                text = `${hours} Jam ${minutes} Menit`;
            } else if (totalMinutes > 0) {
                text = `${totalMinutes} Menit`;
            } else {
                text = 'Baru saja';
            }
        }

        return { text, totalMinutes, totalHours, totalDays: days };
    }, [startDate, serverTime, compact]);

    const [duration, setDuration] = useState(() => calculateDuration());

    useEffect(() => {
        setDuration(calculateDuration());

        const interval = setInterval(() => {
            setDuration(calculateDuration());
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [calculateDuration]);

    if (!duration) return null;

    return (
        <span className={`phase-duration-timer ${className}`}>
            {duration.text}
        </span>
    );
}
