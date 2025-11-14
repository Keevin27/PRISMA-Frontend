import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sancion } from '../Models/sancion';

@Injectable({
  providedIn: 'root'
})
export class SancionService {

  private baseURL = "http://localhost:8080/Sancion";

  constructor(private httpClient: HttpClient) {}

  // Obtiene todas las sanciones de un alumno con filtro de año opcional
  obtenerSancionesPorAlumno(idAlumno: number, anio?: number): Observable<Sancion[]> {
    let params = new HttpParams();
    
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    
    return this.httpClient.get<Sancion[]>(`${this.baseURL}/alumno/${idAlumno}`, { params });
  }

  // Obtiene sanciones por ID de grado
  obtenerSancionesPorGrado(idGrado: number, anio?: number): Observable<Sancion[]> {
    let params = new HttpParams();
    
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    
    return this.httpClient.get<Sancion[]>(`${this.baseURL}/grado/${idGrado}`, { params });
  }

  // Crea una nueva sanción
  crearSancion(payload: any): Observable<Sancion> {
    return this.httpClient.post<Sancion>(`${this.baseURL}/crear`, payload);
  }

  // Elimina una sanción por su ID
  eliminarSancion(idSancion: number): Observable<any> {
    return this.httpClient.delete(`${this.baseURL}/${idSancion}`);
  }

  // Descarga el reporte de una sanción grave (PDF o archivo)
  descargarReporte(idSancion: number): Observable<Blob> {
    return this.httpClient.get(`${this.baseURL}/descargar/${idSancion}`, {
      responseType: 'blob'
    });
  }

  // Actualiza una sanción existente
  actualizarSancion(idSancion: number, payload: any): Observable<Sancion> {
    return this.httpClient.put<Sancion>(`${this.baseURL}/actualizar/${idSancion}`, payload);
  }

}