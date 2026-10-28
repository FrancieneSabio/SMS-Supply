import { Injectable, NgZone, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<any | null>(null);
  ready: Promise<void>;

  constructor(zone: NgZone) {
    this.ready = (async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      zone.run(() => this.user.set(session?.user ?? null));

      // Listen for auth changes
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

// Blocks every page except login and register until the person is signed in
export const authGuard: CanActivateFn = async () => {
  const a = inject(AuthService);
  const router = inject(Router);
  await a.ready;
  return a.user() ? true : router.createUrlTree(['/login']);
};