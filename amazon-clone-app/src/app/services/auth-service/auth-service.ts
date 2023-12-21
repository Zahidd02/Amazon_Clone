import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();

  private userName = new BehaviorSubject<string>("Guest");
  userName$ = this.userName.asObservable();

  private readonly jwt: string = 'USER_TOKEN'; // Used as a key to store authenticated user jwt from Azure.

  constructor(private msalService: MsalService) {
    let msalInitializer = this.msalService.initialize(); // Initializing this.msalService,
                                                         // because it needs to be initialize()'ed before login()/logout() method call.
    if (!this.checkIfUserStillLoggedIn()) {
      msalInitializer.subscribe(() => {
        this.msalService.instance.handleRedirectPromise().then((response: AuthenticationResult | null) => {
          if (response !== null) {
            this.isAuthenticated.next(true);
            this.userName.next(response.account.idTokenClaims!["given_name"] as string || "Guest");
            localStorage.setItem(this.jwt, JSON.stringify(response.idTokenClaims));   // Keeps user logged in even after refresh.
            // console.log("Authentication Successful: ", response);
          }
        }).catch(error => {
          console.log("Authentication error:", error);
        })
      });
    }
  }

  checkIfUserStillLoggedIn(): boolean { 
    let item = localStorage.getItem(this.jwt)
    if (item) {
      this.userName.next(JSON.parse(item)["given_name"]);
      this.isAuthenticated.next(true);
      return true;
    }
    return false;
  }

  login() {
    this.msalService.loginRedirect(); // Redirectes the user to Azure Login page.
  }

  logout() {
    this.msalService.logoutRedirect(); 
    this.isAuthenticated.next(false);
    localStorage.removeItem(this.jwt);
  }

  //// Use below code for a pop-up style login...
  //login() {
  //  this.authservice.loginpopup()
  //    .subscribe({
  //      next: (response: authenticationresult) => {
  //        console.log(response);
  //        this.isauthenticated = response !== null && response !== undefined;
  //        this.username = this.isauthenticated ? response.account?.idtokenclaims?["given_name"] || null : null;
  //      },
  //      error: (error) => {
  //        console.error('login failed:', error);
  //      }
  //    });
  //}

  //logout() {
  //  this.authservice.logoutpopup()
  //    .subscribe(() => {
  //      this.isauthenticated = false;
  //      this.username = null;
  //    });
  //}

}
