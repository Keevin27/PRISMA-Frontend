import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetalleMenu } from '../Models/detalle-menu';
import { Observable } from 'rxjs';
import { Semana } from '../Models/semana';

@Injectable({
  providedIn: 'root'
})
export class SemanaService {

  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/Semana"

  constructor(private httpClient: HttpClient) { }

  obtenerSemanas(): Observable<Semana[]> {
    return this.httpClient.get<Semana[]>(`${this.baseURL}/`);
  }
}
