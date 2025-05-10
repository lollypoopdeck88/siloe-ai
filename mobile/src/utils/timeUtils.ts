export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.split(/\s+/).length;
  return Math.ceil((words / wordsPerMinute) * 60 * 1000); // Return milliseconds
};

export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds < 60000) {
    return 'Less than a minute';
  }

  const minutes = Math.ceil(milliseconds / 60000);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
};

export const getTimestamp = (): string => {
  return new Date().toISOString();
};

export const calculateProgress = (
  timeSpent: number,
  totalTime: number
): number => {
  return Math.min(timeSpent / totalTime, 1);
};

export const isReadingComplete = (
  timeSpent: number,
  totalTime: number,
  threshold = 0.8
): boolean => {
  return calculateProgress(timeSpent, totalTime) >= threshold;
};
