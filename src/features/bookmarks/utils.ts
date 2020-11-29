import { sub, formatISO } from 'date-fns';

const timeFilterToDays: {
  [timeFilterKey: string]: number;
} = {
  year: 365,
  month: 30,
  week: 7,
  day: 1,
};

export function convertTimeFilterToEndIntervalISOString(
  timeFilter: 'all' | 'year' | 'month' | 'week' | 'day' | string
): string {
  const timeFilterInDays = timeFilterToDays[timeFilter] || 'all';

  if (timeFilterInDays === 'all') {
    return new Date(2020, 1, 1).toISOString();
  }

  const now = new Date();
  const endIntervalISOString = sub(now, { days: timeFilterInDays });
  return formatISO(endIntervalISOString);
}
