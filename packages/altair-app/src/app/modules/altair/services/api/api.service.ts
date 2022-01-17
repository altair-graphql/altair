import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { APIClient } from './graphql';
import { from } from 'rxjs';
import { auth0 } from './auth0';
import { signinWithPopup, supabase } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private apollo: Apollo,
    public apiClient: APIClient,
  ) { }

  // TODO: Remove !!!
  private async accountLoginWithAuth0Promise() {
    await auth0.loginWithPopup({
      redirect_uri: location.origin,
    });
    return this.getToken();
  }

  private async accountLoginWithSupabasePromise() {
    return signinWithPopup('google', {
      redirectTo: location.origin,
    });
  }

  // TODO: Remove !!!
  accountLoginWithAuth0() {
    return from(this.accountLoginWithAuth0Promise());
  }

  accountLoginWithSupabase() {
    return from(this.accountLoginWithSupabasePromise());
  }

  getToken() {
    return auth0.getTokenSilently();
  }

  getSession() {
    return supabase.auth.session();
  }

  logout() {
    auth0.logout();
    this.apollo.client.resetStore();
  }
}
