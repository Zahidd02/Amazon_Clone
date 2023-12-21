import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orderDetailUrl: string = "https://amazoncloneapi.azurewebsites.net/api/product/getorderbyid?id="
  orderData?: any = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    let paymentId: string = this.route.snapshot.queryParamMap.get('id') || "";
    if (paymentId) {
      this.getOrderDetails(paymentId);
      localStorage.setItem("last_transaction", paymentId);
    }
    else {
      this.getOrderDetails(localStorage.getItem("last_transaction") || "");
    }
  }

  async getOrderDetails(paymentId: string) {
    try {
      await axios.get(this.orderDetailUrl + paymentId).then((response) => {
        this.orderData = response.data;
      })
    } catch (error) {
      console.log(`Some error occurred! Order Id: ${paymentId} not found.`);
      console.error(error);
    }
  }
}
