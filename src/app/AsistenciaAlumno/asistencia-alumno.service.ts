import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AsistenciaAlumno } from './asistencia-alumno';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaAlumnoService {

  private baseURL = "http://localhost:8080/AsisAlum/asistencia-alumno";

  constructor(private httpClient: HttpClient) {}

  /**
   * Agrega una nueva asistencia
   */
  agregarAsistenciaAlumno(asistenciaAlumno: AsistenciaAlumno): Observable<Object> {
    return this.httpClient.post(`${this.baseURL}`, asistenciaAlumno);
  }

  /**
   * Consulta por grado y rango de fechas (nuevo método)
   */
  obtenerAsistenciasPorGradoYFechas(idGrado: string, inicio: string, fin: string): Observable<AsistenciaAlumno[]> {
    const params = new HttpParams()
      .set('idGrado', idGrado)
      .set('inicio', inicio)
      .set('fin', fin);

    return this.httpClient.get<AsistenciaAlumno[]>(`${this.baseURL}-filtro`, { params });
  }


}

