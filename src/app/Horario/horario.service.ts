import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

   private baseURL = 'http://localhost:8080/Horarios';

  constructor(private httpClient: HttpClient) { }

  generarHorarios(): Observable<string> {
    return this.httpClient.post(`${this.baseURL}/generar`, {}, { responseType: 'text' });
  }

  listarHorarios(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseURL}/listar`);
  }

  obtenerPorBloque(idBloque: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseURL}/bloque/${idBloque}`);
  }
  eliminarAsigacion(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseURL}/${id}`);
  }

  eliminarTodos(): Observable<string> {
    return this.httpClient.delete(`${this.baseURL}/eliminar`, { responseType: 'text' });
  }
  obtenerPorGrado(idGrado: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseURL}/porGrado/${idGrado}`);
  }

  obtenerPorDocente(duiDocente: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseURL}/porDocente/${duiDocente}`);
  }

  
}