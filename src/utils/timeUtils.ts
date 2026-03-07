/**
 * Utility functions for time formatting in the SAT test-taking system
 */

/**
 * Formats time in seconds to MM:SS format (e.g., "2:45")
 * Used for displaying the main test timer
 * 
 * @param seconds The time in seconds
 * @returns Formatted time string in MM:SS format
 */
export const formatTimeMMSS = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats time in seconds to "MMm SSs" format (e.g., "2m 45s")
 * Used for displaying time spent on questions in reports and overviews
 * 
 * @param seconds The time in seconds
 * @returns Formatted time string in "MMm SSs" format
 */
export const formatTimeMMmSSs = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};
