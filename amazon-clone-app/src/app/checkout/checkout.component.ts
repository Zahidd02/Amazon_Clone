import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BasketService } from '../services/basket-items/basket.service';
import { AuthService } from '../services/auth-service/auth-service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  items: any[] = [];
  userName = "Guest"
  constructor(private _basketService: BasketService, private _authService: AuthService) { }

  ngOnInit() {
    this.items = this._basketService.items;
    this._authService.userName$.subscribe((name) => {
      this.userName = name;
    })
  }

  deleteProduct(tempId: string) {
    this.items = this.items.filter(item => item.tempId !== tempId);
    this._basketService.removeFromBasket(tempId);
  }
}
