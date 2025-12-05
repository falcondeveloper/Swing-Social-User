export function formatDateEST(utcString?: string | null, fallback = "TBD"): string {
    if (!utcString) return fallback;

    const d = new Date(utcString);
    if (isNaN(d.getTime())) return fallback;

    try {
        const formatted = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "America/New_York",
        }).format(d);

        return `${formatted} (EST)`;
    } catch (err) {
        return fallback;
    }
}
