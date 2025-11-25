/**
 * Generate an iCalendar (.ics) file for an event
 * Follows RFC 5545 specification
 */

interface EventData {
    title: string;
    description: string;
    eventDate: Date | string;
    eventEndDate?: Date | string;
    location?: string;
}

/**
 * Format a date to iCalendar format (YYYYMMDDTHHMMSS)
 */
function formatICalDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters for iCalendar format
 */
function escapeICalText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/**
 * Generate iCalendar file content
 */
export function generateICalendar(event: EventData): string {
    const startDate = formatICalDate(event.eventDate);
    const endDate = event.eventEndDate
        ? formatICalDate(event.eventEndDate)
        : formatICalDate(new Date(new Date(event.eventDate).getTime() + 2 * 60 * 60 * 1000)); // Default 2 hours

    const now = formatICalDate(new Date());

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SDC Event Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `DTSTAMP:${now}`,
        `SUMMARY:${escapeICalText(event.title)}`,
        `DESCRIPTION:${escapeICalText(event.description)}`,
    ];

    if (event.location) {
        icsContent.push(`LOCATION:${escapeICalText(event.location)}`);
    }

    icsContent.push(
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    );

    return icsContent.join('\r\n');
}

/**
 * Download iCalendar file
 */
export function downloadICalendar(event: EventData, filename: string = 'event.ics'): void {
    const icsContent = generateICalendar(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
