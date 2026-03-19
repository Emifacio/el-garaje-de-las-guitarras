/**
 * Date Utility Module
 * 
 * Centralizes date parsing and formatting for product lifecycle.
 * Handles sold_date specifically with DD/MM/YYYY format from forms.
 */

const DATE_INPUT_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

/**
 * Parse DD/MM/YYYY date string to ISO format.
 * Returns null if the date is invalid.
 */
export function parseSoldDate(dateStr: string | null | undefined): string | null {
    if (!dateStr || !dateStr.trim()) {
        return null;
    }

    const trimmed = dateStr.trim();
    
    if (!DATE_INPUT_REGEX.test(trimmed)) {
        console.warn(`[DateUtils] Invalid sold_date format: "${dateStr}". Expected DD/MM/YYYY.`);
        return null;
    }

    const [day, month, year] = trimmed.split('/').map(Number);
    
    // Validate date components
    if (month < 1 || month > 12) {
        console.warn(`[DateUtils] Invalid month in sold_date: ${month}`);
        return null;
    }
    
    if (day < 1 || day > 31) {
        console.warn(`[DateUtils] Invalid day in sold_date: ${day}`);
        return null;
    }

    // Create date in UTC to avoid timezone issues
    const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00.000Z`);
    
    if (isNaN(date.getTime())) {
        console.warn(`[DateUtils] Invalid date parsed from: "${dateStr}"`);
        return null;
    }

    return date.toISOString();
}

/**
 * Format an ISO date string to DD/MM/YYYY for display.
 * Returns empty string if the date is null/undefined.
 */
export function formatSoldDateForDisplay(isoDate: string | null | undefined): string {
    if (!isoDate) {
        return '';
    }

    try {
        const date = new Date(isoDate);
        
        if (isNaN(date.getTime())) {
            return '';
        }

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`;
    } catch {
        return '';
    }
}

/**
 * Get current ISO date string.
 */
export function getCurrentISODate(): string {
    return new Date().toISOString();
}

/**
 * Determine sold_date value based on new status.
 * Returns ISO string if transitioning to 'vendido', null otherwise.
 */
export function determineSoldDate(
    currentSoldDate: string | null,
    newStatus: string
): string | null {
    if (newStatus === 'vendido') {
        return currentSoldDate || getCurrentISODate();
    }
    return null;
}
