// src/app/services/coordinacion.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoordinacionService {

  private apiUrl = 'http://localhost:8080/coordinacion';

  constructor(private http: HttpClient) { }

  getAsignaciones(anio?: number | null): Observable<any[]> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anioAcademico', anio.toString());
    }
    return this.http.get<any[]>(`${this.apiUrl}/asignaciones`, { params });
  }
 getDocentesDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/docentes-disponibles`);
  }

  getGradosDisponibles(anio?: number | null): Observable<any[]> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anioAcademico', anio.toString());
    }
    return this.http.get<any[]>(`${this.apiUrl}/grados-disponibles`, { params });
  }

  crearAsignacion(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asignar`, datos);
  }

  actualizarAsignacion(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/actualizar/${id}`, datos);
  }

  eliminarAsignacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/eliminar/${id}`);
  }
}