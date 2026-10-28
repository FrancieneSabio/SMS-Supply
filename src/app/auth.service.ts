import { Injectable, NgZone, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  router = inject(Router);
  user = signal<any | null>(null);
  logoutMessage = signal<string | null>(null);
  ready: Promise<void>;

  constructor(zone: NgZone) {
    this.ready = (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      zone.run(() => this.user.set(session?.user ?? null));

      supabase.auth.onAuthStateChange((_event, session) => {
        zone.run(() => this.user.set(session?.user ?? null));
      });
    })();
  }

  async login(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    return result.data;
  }

  async register(email: string, password: string) {
    const result = await supabase.auth.signUp({ email, password });
    if (result.error) throw result.error;
    return result.data;
  }

  async logout() {
    // 1. Instantly clear user state, show notification, and route to login
    this.user.set(null);
    this.logoutMessage.set('Log out successfully!');
    this.router.navigate(['/login']);

    // 2. Clear success message after a brief moment
    setTimeout(() => {
      this.logoutMessage.set(null);
    }, 1200);

    // 3. Sign out from Supabase in the background
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }
}

// Blocks every page except login and register until the person is signed in
export const authGuard: CanActivateFn = async () => {
  const a = inject(AuthService);
  const router = inject(Router);
  await a.ready;
  return a.user() ? true : router.createUrlTree(['/login']);
};