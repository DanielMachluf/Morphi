// Format an ISO timestamp into a human-readable relative time.
export function timeAgo(iso?: string): string {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";

    const diff = Math.max(0, Date.now() - then);
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return "just now";

    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;

    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;

    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;

    const wk = Math.floor(day / 7);
    if (wk < 5) return `${wk}w ago`;

    const mo = Math.floor(day / 30);
    if (mo < 12) return `${mo}mo ago`;

    return `${Math.floor(day / 365)}y ago`;
}

// Format an ISO timestamp into a short hour:minute clock string.
export function formatClockTime(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
