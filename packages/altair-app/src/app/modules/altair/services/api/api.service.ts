import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { APIClient } from './graphql';
import { from } from 'rxjs';
import { auth0 } from './auth0';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private apollo: Apollo,
    public apiClient: APIClient,
  ) { }

  private async accountLoginWithAuth0Promise() {
    await auth0.loginWithPopup({
      redirect_uri: location.origin,
    });
    return this.getToken();
  }

  accountLoginWithAuth0() {
    return from(this.accountLoginWithAuth0Promise());
  }

  getToken() {
    return auth0.getTokenSilently();
  }

  logout() {
    auth0.logout();
    this.apollo.client.resetStore();
  }
}
