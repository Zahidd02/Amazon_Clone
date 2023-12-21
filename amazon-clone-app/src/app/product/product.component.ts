import { Component, Input, OnInit } from '@angular/core';
import { ProductsService } from '../services/product-info/products.service';
import { IProduct } from '../interface/product';
import { BasketService } from '../services/basket-items/basket.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  @Input() productId: number = 0;
  isDataLoaded: boolean = false;

  productIdDB?: string;
  productName?: string;
  title?: string;
  price?: number;
  imageSrc: string = "";
  productRating?: number;

  starHtml: string = "";
 
  constructor(private _productService: ProductsService, private _basketService: BasketService) { }

  async ngOnInit() {
    // Placeholder Products code only 
    //if (this.isDataLoaded == true) {
    //  this.productIdDB = "prod100X"
    //  this.title = "ASUS ROG Strix Go BT Gaming Headset (AI Noise-canceling Microphone, Hi-Res Audio, Active Noise Cancellation, Bluetooth, 3.5mm, Compatible with Laptop, PS5, Nintendo Switch and Smart Devices)"
    //  this.price = 999;
    //  this.starsToStarHtml(5);
    //  this.productRating = 4;
    //  this.imageSrc = "https://m.media-amazon.com/images/I/61Od+O32YgS._AC_SL1500_.jpg";
    //  return;
    //}

    await  this._productService.getProductData(this.convertIdToProduct(this.productId)).subscribe((data: IProduct) => {
      this.productIdDB = data.id;
      this.productName = data.name;
      this.title = data.description;
      this.price = data.price;
      this.productRating = data.star;
      
      this.starsToStarHtml(data.star);
      this.renderProductImage(data.image_name);
      
      this.isDataLoaded = true;
    },
      error => {
        console.log("Product data not fetched. Please check Azure App service. Error details: " + error.message);
      }) 
  }

  async renderProductImage(imageName: string = "") {
    await this._productService.getProductImage(imageName)
      .subscribe((blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.imageSrc = reader.result as string;
        };
        reader.readAsDataURL(blob);
      });
  }

  starsToStarHtml(star: number = 0) {
    for (var i = 0; i < star; i++) {
      this.starHtml += "<span>⭐</span>"
    }
  }

  convertIdToProduct(id: number): string {
    const str = "prod10";
    if (id >= 0 && id <= 9) {
      return str + "0" + id
    }
    else {
      return str + id
    }
  }

  addItemToBasket() {
    var item: any = {
      tempId: "P" + Math.ceil(Math.random() * 100000), // Creates unique IDs for each item in the basket.
      title: this.title,
      imageSrc: this.imageSrc,
      price: this.price,
      star: this.productRating
    }

    this._basketService.items.push(item)
    this._basketService.updateBasketLength()
  }
}
