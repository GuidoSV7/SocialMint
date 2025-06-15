/**
 * Formats a duration in seconds into a human-readable string
 * @param seconds The duration in seconds (supports both number and bigint)
 * @returns A formatted string like "2d 5h 30m" or "45m" or "30s"
 */
export const formatDuration = (seconds: bigint | number): string => {
  const totalSeconds = Number(seconds);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.length > 0 ? parts.join(' ') : `${totalSeconds}s`;
}; 