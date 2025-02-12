export const formatSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`;
  }
  const units = ['KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let sizeInUnit = size / 1024;
  while (sizeInUnit >= 1024 && unitIndex < units.length - 1) {
    sizeInUnit /= 1024;
    unitIndex++;
  }
  return `${sizeInUnit.toFixed(2)} ${units[unitIndex]}`;
};

export function formatTime(time: number): string {
  if (time < 1000) {
    return `${parseFloat(time.toFixed(3))} ms`;
  }
  if (time < 60000) {
    return `${parseFloat((time / 1000).toFixed(2))} s`;
  }
  const minutes = Math.floor(time / 60000);
  const seconds = parseFloat(((time % 60000) / 1000).toFixed(2));
  return `${minutes} min ${seconds} s`;
}
