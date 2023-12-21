import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BasketService } from '../services/basket-items/basket.service';

@Component({
  selector: 'app-order-items',
  templateUrl: './order-items.component.html',
  styleUrls: ['./order-items.component.css']
})
export class OrderItemsComponent implements OnChanges {
  items?: any[];
  @Input() orderData?: any;
  createdDate: string = ""

  constructor(private datePipe: DatePipe, private _basketService: BasketService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orderData'] && changes['orderData'].currentValue) {
      this.createdDate = this.datePipe.transform(this.orderData.created * 1000, 'medium') || "";

      if (this._basketService.items.length > 0) {
        this.items = this._basketService.items;
        localStorage.setItem("order_item", JSON.stringify(this.items));
        this._basketService.emptyBasket();
      }
      else {
        this.items = JSON.parse(localStorage.getItem("order_item") || "");
      }
    }
  }
}
