import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { signinWithPopup, supabase } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  private async accountLoginWithSupabasePromise() {
    return signinWithPopup('google', {
      redirectTo: location.origin,
    });
  }

  accountLoginWithSupabase() {
    return from(this.accountLoginWithSupabasePromise());
  }

  getSession() {
    return supabase.auth.session();
  }

  async logout() {
    await supabase.auth.signOut();
  }
}
