import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Alimento } from '../Models/alimento';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlimentoService {

  private baseURL = "http://localhost:8080/Alimento"

  constructor(private httpClient: HttpClient) { }

  obtenerListaAlimentos(): Observable<Alimento[]> {
    return this.httpClient.get<Alimento[]>(`${this.baseURL}/`);
  }
  obtenerListaAlimentosActivos(): Observable<Alimento[]> {
    return this.httpClient.get<Alimento[]>(`${this.baseURL}/activos`);
  }
  agregarAlimento(alimento: Alimento): Observable<Object> {
    return this.httpClient.post(`${this.baseURL}/alimento`, alimento)
  }
  actualizarAlimento(id: number, alimento: Alimento): Observable<Object> {
    return this.httpClient.put(`${this.baseURL}/alimento/${id}`, alimento);
  }
}
