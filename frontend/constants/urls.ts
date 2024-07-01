const urls = {
  NOTE_NEW: (date: string) => `/note/new/${date}`,
  USER_PAGE: '/user',
  CONTACT_PAGE: '/contact',
  TOP_PAGE: '/',
  TIMER_PAGE: '/timer'
} as const satisfies { [key: string]: string | ((...args: any[]) => string) };

export const URLS = urls;
