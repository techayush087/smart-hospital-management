import { Injectable } from '@angular/core';

const TOKEN_KEY = 'shapms.token';

@Injectable({ providedIn: 'root' })
export class SessionService {
  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
