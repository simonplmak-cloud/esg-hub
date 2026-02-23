/**
 * ESG Hub Utility Functions
 * Shared utility functions for the application
 */

/**
 * Formats a permalink by removing trailing slashes
 * @param permalink - The permalink to format
 * @returns The formatted permalink without trailing slash
 */
export function formatPermalink(permalink: string): string {
  return permalink.replace(/\/$/, "");
}

/**
 * Formats a permalink for canonical URL by removing trailing slashes
 * and ensuring it starts with a forward slash
 * @param permalink - The permalink to format
 * @returns The formatted permalink for canonical URLs
 */
export function formatCanonicalUrl(baseUrl: string, permalink: string): string {
  return `${baseUrl}${formatPermalink(permalink)}`;
}
