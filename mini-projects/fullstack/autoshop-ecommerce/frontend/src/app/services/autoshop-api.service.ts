import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3300/api/v1';

export interface Car {
  id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  transmission: string;
  mileageKm: number;
  color: string;
  bodyType: string;
  description: string;
  imageUrl: string;
  available: boolean;
  tags?: string[];
  engine?: string;
  powerHp?: number;
  torqueNm?: number;
  doors?: number;
  seats?: number;
  trunkLiters?: number;
  consumptionL100?: number;
  co2Gkm?: number;
  acceleration0to100?: number;
  topSpeedKmh?: number;
  drivetrain?: string;
  equipment?: string[];
}

@Injectable({ providedIn: 'root' })
export class AutoshopApiService {
  constructor(private http: HttpClient) {}

  health() {
    return this.http.get(`${API}/health`);
  }

  cars(q?: string): Observable<Car[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<Car[]>(`${API}/cars`, { params });
  }

  car(id: number): Observable<Car> {
    return this.http.get<Car>(`${API}/cars/${id}`);
  }

  createCar(car: Partial<Car>): Observable<Car> {
    return this.http.post<Car>(`${API}/cars`, car);
  }

  updateCar(id: number, car: Partial<Car>): Observable<Car> {
    return this.http.put<Car>(`${API}/cars/${id}`, car);
  }

  deleteCar(id: number) {
    return this.http.delete(`${API}/cars/${id}`);
  }

  accessories(brand?: string): Observable<any[]> {
    let params = new HttpParams();
    if (brand) params = params.set('brand', brand);
    return this.http.get<any[]>(`${API}/accessories`, { params });
  }

  recommendations(budget?: number) {
    let params = new HttpParams();
    if (budget) params = params.set('budget', budget);
    return this.http.get<any[]>(`${API}/ai/recommendations`, { params });
  }

  estimate(carId: number) {
    return this.http.get(`${API}/ai/cars/${carId}/estimate`);
  }

  smartSearch(q: string) {
    return this.http.get<any[]>(`${API}/ai/search`, { params: { q } });
  }

  chat(message: string, userId = 1) {
    return this.http.post(`${API}/ai/chat`, { message, userId });
  }

  createOrder(userId: number, items: any[]) {
    return this.http.post(`${API}/orders`, { userId, items });
  }
}
