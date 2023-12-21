import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BasketService } from '../services/basket-items/basket.service';
import { PaymentIntentResult, StripeCardElementChangeEvent, loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { Router } from '@angular/router';
import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus';
import { AuthService } from '../services/auth-service/auth-service';


const stripePromise = loadStripe("pk_test_51OMxw0J6RW9kbSMXp5MMqGOfywl5PhxsY92EHgVwRYF5mKuAKsoefjQ6Q3K90sGfcL1ENpibuamnBJP0aIi2R9IN00Myj2OkPP");

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  items: any[] = []; //Renders all items from BasketService.
  @ViewChild('payment__stripe') stripeCardHtml!: ElementRef; //Provides a way with direct access to the DOM element: #payment__stripe
  private readonly jwt: string = 'USER_TOKEN'; 
  private stripe: any;
  private clientSecret: any; //Binds a transaction process in Stripe.
  cardElement: any;
  baseUrl: string = "https://azurepaymentfunc.azurewebsites.net/api/"; //(PROD Env.)
  //baseUrl: string = "http://localhost:7071/api/"; //(DEV Env.)
  cosmosOrderUrl: string = "https://amazoncloneapi.azurewebsites.net/api/product/postneworder";

  totAmount: number = 0;
  basketLength: number = 0;
  shippingAddress: string = ""; 
  btnProcessing = false;
  btnError = "";

  constructor(private _basketService: BasketService, private router: Router, private _authService: AuthService) { }

  ngOnInit() {
    this._basketService.basketLength$.subscribe((value) => {
      this.basketLength = value;
      this.items = this._basketService.items;
      this.totAmount = 0;
      for (var i in this.items) {
        this.totAmount += parseFloat(this.items[i]['price']);
      };
    });                  

    this.addShippingAddress(this.jwt);
    this.initialize();
  }

  async initialize() {
    this.stripe = await stripePromise;
    const elements = this.stripe!.elements();

    const card = elements.create('card'); // Creates card elements in #payment__stripe automatically
    card.on('change', (event: StripeCardElementChangeEvent) => {
      this.handleChange(event);
    });
    card.mount(this.stripeCardHtml.nativeElement);
    this.cardElement = card;
  }

  handleChange(event: any) {
    if (event.error) {
      this.btnError = event.error.message;
    }
    else {
      this.btnError = "";
    }
  }

  async handleSubmit() {
    this.btnProcessing = true;
    await this.getClientSecret();

    const stripe = await stripePromise;
    stripe?.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.cardElement
      }
    }).then((response: PaymentIntentResult) => {
      if (response.error) {
        //console.error("Some error occurred while processing payment. Please try again later! Error Details: ", response.error.code);
        this.btnError = "Card Declined. Please enter correct card details. " +
                        "Hint: Use test card '4242 4242 4242 4242' and enter random expiry date & CVC";
        this.btnProcessing = false;
        return;
      }
      //console.log(response);
      this.btnError = "";

      this.sendToOrdersQueue(response.paymentIntent).then(() => {
        this.router.navigate(['/orders'],
          { queryParams: { id: response.paymentIntent.id } }); //Redirect user to Orders page only after sendToOrdersQueue() has finished execution.
        this.btnProcessing = false;
      });                                                      
    });
  }

  getClientSecret = async () => {
    const response = await axios({
      method: 'post',
      url: this.baseUrl + `createPayment?amount=${this.totAmount}`
    });
    //console.log(response);
    this.clientSecret = response.data.clientSecret;
  };

  deleteProduct(tempId: string) {
    this.items = this.items.filter(item => item.tempId !== tempId);
    this._basketService.removeFromBasket(tempId);
  }

  addShippingAddress(key: string) {
    let item = localStorage.getItem(key);
    if (item) {
      const json = JSON.parse(item);
      this.shippingAddress += `<p> ${json!.given_name} ${json!.family_name} <br>
                                   ${json!.streetAddress}                   <br>
                                   ${json!.city}, ${json!.state}            <br>
                                   ${json!.country} - ${json!.postalCode}   </p>`;
    }
  }

  private async sendToOrdersQueue(paymentIntent: any) {
    //const connectionString = 'Endpoint=sb://myamazonclonesrvcbus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CxFfB4rlD8jk3PYHouxEAnRGY9RTwN6gl+ASbNk9HNc=';
    let connectionString = ""
    await axios.get("https://amazoncloneapi.azurewebsites.net/api/product/GetAzureMQSecret").then((val) => {
      connectionString = val.data;
    })
    const queueName = 'ordersqueue';
    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(queueName);

    try {
      var orderItems = [];
      const userInfo = JSON.parse(localStorage.getItem(this.jwt) || "");

      for (var i in this.items) {
        orderItems.push({
          prodId: this.items[i].tempId,
          price: this.items[i].price
        })
      }

      const jsonData = { // This data may also be sent to Logistics team - for further processing of the orders.
        id: paymentIntent.id,
        user: userInfo.given_name + " " + userInfo.family_name,
        email: userInfo.emails[0],
        shippingAddress: userInfo.streetAddress + " " + userInfo.city + "-" + userInfo.postalCode,
        shippingState: userInfo.state,
        items: orderItems,
        created: paymentIntent.created,
        amount: paymentIntent.amount / 100 
      };

      const message: ServiceBusMessage = {
        body: jsonData,
        contentType: 'application/json'
      };

      await sender.sendMessages(message);
      axios.post(this.cosmosOrderUrl, jsonData).then((res) => {
        //console.log(res.data.resource)
      });

      console.log('Item sent to Message Queue successfully!');

    } catch (e) {
      console.error("Some error occurred. Cannot send message to the message queue. Error Details: ", e);

    } finally {
      await sender.close();
      await sbClient.close();
    }
  }
}
