import { HttpClient,HttpParams  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Alumno } from './alumno';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private baseURL = "http://localhost:8080/Alu"
  
  constructor(private httpClient: HttpClient) { }

  // Obtener todos los alumnos
  obtenerListaDeAlumnos(): Observable<Alumno[]> {
    return this.httpClient.get<Alumno[]>(`${this.baseURL}/alumnos`);
  }

  // Obtener alumnos por grado
  obtenerListaDeAlumnosPorGrado(grado: string): Observable<Alumno[]> {
    return this.httpClient.get<Alumno[]>(`${this.baseURL}/alumnos/${grado}`);
  }

  // Obtener alumno por ID
  obtenerAlumnoPorId(id: number): Observable<Alumno> {
    return this.httpClient.get<Alumno>(`${this.baseURL}/alumnos/id/${id}`);
  }

  // Obtener alumno por NIE
  obtenerAlumnoPorNie(nie: number): Observable<Alumno> {
    return this.httpClient.get<Alumno>(`${this.baseURL}/alumnos/nie/${nie}`);
  }

  // Crear nuevo alumno
  agregarAlumno(alumno: Alumno): Observable<any> {
    return this.httpClient.post<any>(`${this.baseURL}/crearalumno`, alumno);
  }

  // Actualizar alumno
  actualizarAlumno(id: number, alumno: Alumno): Observable<Alumno> {
    return this.httpClient.put<Alumno>(`${this.baseURL}/alumnos/${id}`, alumno);
  }

  // Eliminar alumno
  eliminarAlumno(id: number): Observable<string> {
    return this.httpClient.delete(`${this.baseURL}/alumnos/${id}`,{ responseType: 'text' });
  }

  // Cambiar estado del alumno
  cambiarEstadoAlumno(id: number): Observable<Alumno> {
    return this.httpClient.put<Alumno>(`${this.baseURL}/alumnos/${id}/estado`, {});
  }

  // Obtener solo alumnos activos
  obtenerAlumnosActivos(): Observable<Alumno[]> {
    return this.httpClient.get<Alumno[]>(`${this.baseURL}/alumnos/activos`);
  }

  // Obtener años disponibles
  obtenerAniosDisponibles(): Observable<number[]> {
    return this.httpClient.get<number[]>(`${this.baseURL}/alumnos/anios`);
  }

  // Obtener secciones disponibles
  obtenerSeccionesDisponibles(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.baseURL}/alumnos/secciones`);
  }

  // Filtrar alumnos por año y sección
  filtrarAlumnos(anio?: string, seccion?: string): Observable<Alumno[]> {
    let url = `${this.baseURL}/alumnos/filtrar`;
    const params: string[] = [];
    
    if (anio) {
      params.push(`anio=${anio}`);
    }
    if (seccion) {
      params.push(`seccion=${seccion}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.httpClient.get<Alumno[]>(url);
  }
  
  // Imprimir expediente individual de un alumno
  imprimirExpedienteAlumno(idAlumno: number): Observable<Blob> {
    const url = `${this.baseURL}/alumnos/${idAlumno}/imprimir`;
    return this.httpClient.get(url, {
      responseType: 'blob'
    });
  }

  // Imprimir listado completo de alumnos
  imprimirListadoAlumnos(): Observable<Blob> {
    const url = `${this.baseURL}/alumnos/imprimir-listado`;
    return this.httpClient.get(url, {
      responseType: 'blob'
    });
  }

  // Imprimir listado filtrado de alumnos
  imprimirListadoAlumnosFiltrado(filtros: { anio?: string; grado?: string }): Observable<Blob> {
    const params = new HttpParams({ fromObject: filtros });
    const url = `${this.baseURL}/alumnos/imprimir-listado-filtrado`;
    return this.httpClient.get(url, {
      params,
      responseType: 'blob'
    });
  }

}

