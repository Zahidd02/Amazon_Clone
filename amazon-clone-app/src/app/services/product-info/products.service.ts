import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiBaseUrl = 'https://amazoncloneapi.azurewebsites.net';//'https://localhost:44332';
  constructor(private http: HttpClient) { }

  getProductData(productId: string): Observable<any> {
    const url = this.apiBaseUrl + `/api/product/getproduct?productId=${productId}`;
    return this.http.get(url, { responseType: 'json' });
  }

  getProductImage(blobName: string): Observable<Blob> {
    const url = `${this.apiBaseUrl}/api/product/getproductimage?blobName=${blobName}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
