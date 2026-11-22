export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

export interface R2ObjectLike {
  body: ReadableStream | Uint8Array | string;
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
}

export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectLike | null>;
  delete(key: string): Promise<void>;
}

export interface Env {
  DB?: D1DatabaseLike;
  R2_BUCKET?: R2BucketLike;
  SESSION_SECRET?: string;
  ADMIN_BOOTSTRAP_PASSCODE?: string;
  TURNSTILE_SECRET_KEY?: string;
  ENVIRONMENT?: string;
  APP_URL?: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: 'client' | 'admin';
  name: string;
  exp: number;
}
