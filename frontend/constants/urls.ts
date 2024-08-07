export const URLS = {
  NOTE_NEW: (date: string) => `/note/new?date=${date}`,
  USER_PAGE: '/user',
  CONTACT_PAGE: '/contact',
  TOP_PAGE: '/',
  TIMER_PAGE: '/timer'
} as const;
