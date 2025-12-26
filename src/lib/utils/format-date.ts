import { differenceInDays } from "date-fns";

/**
 * Formats a date as a relative string in Spanish
 * @param date - The date to format
 * @returns "Hoy", "Ayer", or "Hace X días"
 */
export function formatRelativeDate(date: Date | string): string {
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysDiff = differenceInDays(today, sessionDate);

    if (daysDiff === 0) {
        return "Hoy";
    }
    if (daysDiff === 1) {
        return "Ayer";
    }
    return `Hace ${daysDiff} ${daysDiff === 1 ? "día" : "días"}`;
}
