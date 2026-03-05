import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'ZMW'): string {
    return new Intl.NumberFormat('en-ZM', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

// Format date
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return new Date(date).toLocaleDateString('en-GB', options || defaultOptions);
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date, { month: 'short', day: 'numeric' });
}

// Get status color classes
export function getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
        planning: 'badge-planning',
        in_progress: 'badge-in-progress',
        on_hold: 'badge-on-hold',
        complete: 'badge-complete',
        draft: 'badge-draft',
        sent: 'badge-sent',
        paid: 'badge-paid',
        overdue: 'badge-overdue',
        cancelled: 'badge-cancelled',
        upcoming: 'badge-planning',
        active: 'badge-in-progress',
    };
    return map[status] || 'badge-draft';
}

// Format status label
export function formatStatus(status: string): string {
    return status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Truncate text
export function truncate(str: string, length: number = 100): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// Get file icon based on type
export function getFileIcon(fileType: string | null): string {
    if (!fileType) return 'file';
    if (fileType.includes('pdf')) return 'file-text';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return 'table';
    if (fileType.includes('document') || fileType.includes('word')) return 'file-text';
    return 'file';
}

// Calculate project progress from timeline stages
export function calculateProgress(stages: { status: string }[]): number {
    if (!stages || stages.length === 0) return 0;
    const completed = stages.filter((s) => s.status === 'complete').length;
    return Math.round((completed / stages.length) * 100);
}

// Generate initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
