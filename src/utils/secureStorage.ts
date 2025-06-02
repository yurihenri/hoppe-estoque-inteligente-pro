
/**
 * Secure storage utilities to replace localStorage for sensitive data
 */

interface StorageOptions {
  encrypt?: boolean;
  expiration?: number; // in minutes
}

class SecureStorage {
  private prefix = 'hoppe_secure_';

  // Simple encryption/decryption (in production, use proper encryption)
  private encrypt(data: string): string {
    // Basic encoding - in production, use proper encryption like crypto-js
    return btoa(encodeURIComponent(data));
  }

  private decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return '';
    }
  }

  private isExpired(timestamp: number, expiration: number): boolean {
    const now = Date.now();
    const expirationTime = timestamp + (expiration * 60 * 1000);
    return now > expirationTime;
  }

  set(key: string, value: any, options: StorageOptions = {}): void {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        expiration: options.expiration
      };

      const serialized = JSON.stringify(data);
      const stored = options.encrypt ? this.encrypt(serialized) : serialized;
      
      sessionStorage.setItem(this.prefix + key, stored);
    } catch (error) {
      console.warn('Failed to store data securely:', error);
    }
  }

  get(key: string, encrypted: boolean = false): any {
    try {
      const stored = sessionStorage.getItem(this.prefix + key);
      if (!stored) return null;

      const serialized = encrypted ? this.decrypt(stored) : stored;
      if (!serialized) return null;

      const data = JSON.parse(serialized);
      
      // Check expiration
      if (data.expiration && this.isExpired(data.timestamp, data.expiration)) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.warn('Failed to retrieve data securely:', error);
      return null;
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Secure preferences storage
  setUserPreference(key: string, value: any): void {
    this.set(`pref_${key}`, value, { encrypt: true, expiration: 30 * 24 * 60 }); // 30 days
  }

  getUserPreference(key: string): any {
    return this.get(`pref_${key}`, true);
  }
}

export const secureStorage = new SecureStorage();
