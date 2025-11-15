import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Grado } from '../Models/grado';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GradoService {
  private baseURL = "http://localhost:8080/Grado"  

  constructor(private httpClient: HttpClient) { }

  obtenerGradosPorAnyo(anyo: number): Observable<Grado[]> {
    return this.httpClient.get<Grado[]>(`${this.baseURL}/grados/${anyo}`)
  }
  obtenerTodosLosGrados(): Observable<Grado[]> {
    return this.httpClient.get<Grado[]>(`${this.baseURL}/grados`)
  }
   crearOferta(oferta: any): Observable<Grado[]> {
    return this.httpClient.post<Grado[]>(`${this.baseURL}/crear-oferta`, oferta)
  }

  eliminarGrado(id: number): Observable<any> {
    return this.httpClient.delete(`${this.baseURL}/eliminar/${id}`)
  }
  obtenerGrados(): Observable<Grado[]> {
    return this.httpClient.get<Grado[]>(`${this.baseURL}/grados`);
  }

  obtenerGradoPorId(id: number): Observable<Grado> {
    return this.httpClient.get<Grado>(`${this.baseURL}/${id}`);
  }
}
