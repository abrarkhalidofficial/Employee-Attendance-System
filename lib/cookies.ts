/**
 * Cookie utility functions for client-side cookie management
 */

export const cookieUtils = {
  /**
   * Set a cookie
   */
  set: (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(
      value
    )};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  /**
   * Get a cookie by name
   */
  get: (name: string): string | null => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(
          cookie.substring(nameEQ.length, cookie.length)
        );
      }
    }
    return null;
  },

  /**
   * Delete a cookie
   */
  remove: (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },

  /**
   * Check if a cookie exists
   */
  exists: (name: string): boolean => {
    return cookieUtils.get(name) !== null;
  },
};
