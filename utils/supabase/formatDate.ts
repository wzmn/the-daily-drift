export default function formatDriftDate (dateString: string) {
  const date = new Date(dateString);

  // 1. Format the Date part: 08-Apr-26
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(date).replace(/ /g, '-');

  // 2. Format the Time part: 08:48PM
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date).replace(' ', '');

  return `${datePart} ${timePart}`;
};

// Usage:
// const displayDate = formatDriftDate(drift.newsData.publishedAt);