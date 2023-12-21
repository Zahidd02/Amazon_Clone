import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { PaymentComponent } from './payment/payment.component';
import { OrdersComponent } from './orders/orders.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'orders', component: OrdersComponent },
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
