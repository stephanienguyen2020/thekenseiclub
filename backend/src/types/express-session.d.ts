import 'express-session';

declare module 'express-session' {
  interface SessionData {
    twitter?: {
      codeVerifier: string;
      state: string;
    };
  }
} 