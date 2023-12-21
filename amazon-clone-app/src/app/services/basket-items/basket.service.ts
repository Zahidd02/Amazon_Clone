import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  items: any[] = [];

  private basketLength = new BehaviorSubject<number>(0); 
  basketLength$ = this.basketLength.asObservable(); // Exposing BehaviorSubject as Observable, since it cannot be changed by other components directly.

  constructor() { }

  updateBasketLength() {
    this.basketLength.next(this.items.length);
  }

  removeFromBasket(tempId: string) {
    this.items = this.items.filter(item => item.tempId !== tempId);
    this.updateBasketLength();
  }

  emptyBasket() {
    this.items = []
    this.updateBasketLength();
  }
}
