// Global type declarations for Node.js environment
// These will be replaced by @types/node when dependencies are installed

declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

declare const require: (id: string) => any;

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};

declare const global: any;
declare const __dirname: string;
declare const __filename: string;

declare const Buffer: {
  from(data: string | number[], encoding?: string): any;
  timingSafeEqual?: (a: any, b: any) => boolean;
};

// Node.js built-in modules
declare module 'crypto' {
  export function randomBytes(size: number): any;
  export function randomUUID(): string;
  export function createHash(algorithm: string): any;
  export function createHmac(algorithm: string, key: string): any;
  export function createCipher(algorithm: string, password: string): any;
  export function createDecipher(algorithm: string, password: string): any;
  export function createCipheriv(algorithm: string, key: any, iv: any): any;
  export function createDecipheriv(algorithm: string, key: any, iv: any): any;
  export function timingSafeEqual(a: any, b: any): boolean;
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
}