/**
 * String utility functions
 */
export class StringUtil {
  /**
   * Generate a slug from a string
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Convert to camelCase
   */
  static toCamelCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Convert to PascalCase
   */
  static toPascalCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Convert to snake_case
   */
  static toSnakeCase(text: string): string {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  }

  /**
   * Truncate string with ellipsis
   */
  static truncate(text: string, length: number, suffix: string = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Mask sensitive data
   */
  static mask(text: string, visibleStart: number = 2, visibleEnd: number = 2, maskChar: string = '*'): string {
    if (text.length <= visibleStart + visibleEnd) return text;
    
    const start = text.substring(0, visibleStart);
    const end = text.substring(text.length - visibleEnd);
    const middle = maskChar.repeat(text.length - visibleStart - visibleEnd);
    
    return start + middle + end;
  }

  /**
   * Generate random string
   */
  static randomString(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check if string is email
   */
  static isEmail(text: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  }

  /**
   * Check if string is URL
   */
  static isURL(text: string): boolean {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract numbers from string
   */
  static extractNumbers(text: string): number[] {
    const matches = text.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  }

  /**
   * Remove HTML tags
   */
  static stripHtml(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }
}