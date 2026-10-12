export const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

export const daysAgo = (days: number): string => hoursAgo(days * 24);
export const yearsAgo = (years: number): string => hoursAgo(years * 365 * 24);
