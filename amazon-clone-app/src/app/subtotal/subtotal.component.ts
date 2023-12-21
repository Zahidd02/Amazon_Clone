import { Component, OnInit } from '@angular/core';
import { BasketService } from '../services/basket-items/basket.service';
import { AuthService } from '../services/auth-service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subtotal',
  templateUrl: './subtotal.component.html',
  styleUrls: ['./subtotal.component.css']
})
export class SubtotalComponent implements OnInit {
  amount: number = 0;
  basketLength: number = 0;
  isUserAuthenticated = false;
  constructor(private _basketService: BasketService, private _authService: AuthService, private router: Router) { }

  ngOnInit() {
    this._basketService.basketLength$.subscribe(length => {
      this.basketLength = length;
      this.amount = 0;
      var itemPriceArray = this._basketService.items.map(data => { return data.price })
      for (var price in itemPriceArray) {
        this.amount += parseFloat(itemPriceArray[price]);
      }
    });
    this._authService.isAuthenticated$.subscribe((response) => {
      this.isUserAuthenticated = response;
    });
  }

  redirectToPaymentOrSignIn() {
    if (this.isUserAuthenticated) {
      this.router.navigateByUrl("/payment");
    }
    else {
      this._authService.login();
    }
  }
}
