export function calculateReadingTime(text: string) {
  const wordsPerMinute = 200;

  const words = text.split(/\s+/).filter(Boolean);

  const numberOfWords = words.length;

  const minutes = numberOfWords / wordsPerMinute;

  const roundedMinutes = Math.ceil(minutes);

  return roundedMinutes;
}
