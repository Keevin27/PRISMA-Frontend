import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotasService {
  private baseURL = "http://localhost:8080/notas";

  constructor(private httpClient: HttpClient) { }

  // Consultar notas por materia (Pantalla 1)
  consultarNotasPorMateria(idBloque: number, trimestre: number): Observable<any> {
    const params = new HttpParams()
      .set('idBloque', idBloque.toString())
      .set('trimestre', trimestre.toString());
    return this.httpClient.get<any>(`${this.baseURL}/por-materia`, { params });
  }

  // Obtener alumnos por grado (Pantalla 2)
  obtenerAlumnosPorGrado(idGrado: number, trimestre: number): Observable<any> {
    const params = new HttpParams()
      .set('idGrado', idGrado.toString())
      .set('trimestre', trimestre.toString());
    return this.httpClient.get<any>(`${this.baseURL}/alumnos-por-grado`, { params });
  }

  // Detalle de notas de un alumno (Pantalla 2.1)
  obtenerDetalleNotasAlumno(nie: number, idGrado: number, trimestre: number): Observable<any> {
    const params = new HttpParams()
      .set('idGrado', idGrado.toString())
      .set('trimestre', trimestre.toString());
    return this.httpClient.get<any>(`${this.baseURL}/detalle-alumno/${nie}`, { params });
  }

  // Reporte anual de un alumno (3 trimestres)
obtenerReporteAnual(nie: number, idGrado: number, anio: number): Observable<any> {
  return this.httpClient.get<any>(`${this.baseURL}/reporte-anual/${nie}/${idGrado}/${anio}`);
}
}