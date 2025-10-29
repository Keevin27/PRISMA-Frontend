import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actividad } from '../models/actividad.model';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private baseURL = "http://localhost:8080/actividades";

  constructor(private httpClient: HttpClient) { }

  // Listar actividades por bloque y trimestre (Pantalla 5)
  listarActividades(idBloque: number, trimestre: number): Observable<any> {
    const params = new HttpParams()
      .set('idBloque', idBloque.toString())
      .set('trimestre', trimestre.toString());
    return this.httpClient.get<any>(`${this.baseURL}/listar`, { params });
  }

  // Crear nueva actividad
  crearActividad(actividadData: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseURL}/crear`, actividadData);
  }

  // Actualizar actividad
  actualizarActividad(idActividad: number, actividadData: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseURL}/actualizar/${idActividad}`, actividadData);
  }

  // Eliminar actividad
  eliminarActividad(idActividad: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/eliminar/${idActividad}`);
  }

  // Obtener alumnos para asignar notas (Pantalla 5.1)
  obtenerAlumnosParaNotas(idActividad: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseURL}/alumnos-para-notas/${idActividad}`);
  }

  // Asignar nota a un alumno
  asignarNota(notaData: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseURL}/asignar-nota`, notaData);
  }

  // Eliminar nota de un alumno
  eliminarNota(idNotaActividad: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/eliminar-nota/${idNotaActividad}`);
  }
}