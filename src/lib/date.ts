import { format, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function weekStartStr(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function weekEndStr(): string {
  return format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function monthStartStr(): string {
  return format(startOfMonth(new Date()), 'yyyy-MM-dd')
}

export function monthEndStr(): string {
  return format(endOfMonth(new Date()), 'yyyy-MM-dd')
}

export function nowTimeStr(): string {
  return format(new Date(), 'HH:mm')
}

export function formatDisplayDate(dateStr: string): string {
  return format(new Date(dateStr), 'M/d (EEE)', { locale: zhTW })
}

export function formatDisplayDateTime(dateStr: string, timeStr: string): string {
  return `${format(new Date(dateStr), 'M/d')} ${timeStr}`
}
