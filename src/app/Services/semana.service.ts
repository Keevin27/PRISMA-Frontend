import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetalleMenu } from '../Models/detalle-menu';
import { Observable } from 'rxjs';
import { Semana } from '../Models/semana';

@Injectable({
  providedIn: 'root'
})
export class SemanaService {

  private baseURL = "http://localhost:8080/Semana"

  constructor(private httpClient: HttpClient) { }

  obtenerSemanas(): Observable<Semana[]> {
    return this.httpClient.get<Semana[]>(`${this.baseURL}/`);
  }
}
