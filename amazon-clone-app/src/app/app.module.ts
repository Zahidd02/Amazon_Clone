import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { HttpClientModule } from '@angular/common/http';
import { CheckoutComponent } from './checkout/checkout.component';
import { SubtotalComponent } from './subtotal/subtotal.component';
import { CheckoutProductsComponent } from './checkout-products/checkout-products.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MSAL_INSTANCE, MsalModule, MsalService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './auth-config';
import { PaymentComponent } from './payment/payment.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderItemsComponent } from './order-items/order-items.component';
import { DatePipe } from '@angular/common';

export function MSALInstanceFactory(): IPublicClientApplication {
  const msalInstance = new PublicClientApplication(msalConfig);
  return msalInstance;
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    ProductComponent,
    CheckoutComponent,
    SubtotalComponent,
    CheckoutProductsComponent,
    PaymentComponent,
    OrdersComponent,
    OrderItemsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    HttpClientModule,
    ReactiveFormsModule,
    MsalModule,
    FormsModule
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
