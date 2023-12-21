import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-checkout-products',
  templateUrl: './checkout-products.component.html',
  styleUrls: ['./checkout-products.component.css']
})
export class CheckoutProductsComponent implements OnInit {
  @Input() item!: any;
  @Output() onDelete = new EventEmitter<string>();
  @Input() isBtnHidden: boolean = false;

  tempId?: string;
  title?: string;
  price?: number;
  imageSrc: string = "";
  starHtml: string = "";

  ngOnInit() {
    this.renderProductDetails();
  }

  renderProductDetails() {
    this.tempId = this.item.tempId;
    this.title = this.item.title;
    this.imageSrc = this.item.imageSrc;
    this.price = this.item.price;
    for (var i = 0; i < this.item.star; i++) {
      this.starHtml += "<span>⭐</span>"
    }
  }

  // Emitted event caught by parent component: app-checkout
  deleteProduct() { 
    this.onDelete.emit(this.tempId); // Emitting 'this.tempId' since it is uniquely tied to each item in the basket.
  }
}
