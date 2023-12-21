import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BasketService } from '../services/basket-items/basket.service';
import { AuthService } from '../services/auth-service/auth-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  basketItems: number = 0;
  isAuthenticated = false;
  userName = "";

  constructor(private _basketService: BasketService, private _authService: AuthService) { }

  ngOnInit() {
    this._basketService.basketLength$.subscribe((value) => {
      this.basketItems = value;
    });
    this._authService.isAuthenticated$.subscribe((result) => {
      this.isAuthenticated = result;
    })
    this._authService.userName$.subscribe((name) => {
      this.userName = name;
    })
  }

  login() {
    this._authService.login();
  }

  logout() {
    this._authService.logout();
  }
}
