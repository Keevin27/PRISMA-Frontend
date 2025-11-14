import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BloqueService {
  private baseURL = "http://localhost:8080/asignarDocenteAMateria";

  constructor(private httpClient: HttpClient) { }

  //Ahora acepta parámetro opcional de año
  obtenerTodosBloques(anioAcademico?: number): Observable<any[]> {
    let params = new HttpParams();
    if (anioAcademico) {
      params = params.set('anioAcademico', anioAcademico.toString());
    }
    return this.httpClient.get<any[]>(`${this.baseURL}/bloques`, { params });
  }

  //
  obtenerMisBloquesDocente(anioAcademico?: number): Observable<any[]> {
    let params = new HttpParams();
    if (anioAcademico) {
      params = params.set('anioAcademico', anioAcademico.toString());
    }
    return this.httpClient.get<any[]>(`${this.baseURL}/mis-bloques`, { params });
  }



}