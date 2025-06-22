import { HttpClient } from '@angular/common/http';
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

  // Eliminar alumno (cambiar estado)
  eliminarAlumno(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseURL}/alumnos/${id}`);
  }

  // Cambiar estado del alumno
  cambiarEstadoAlumno(id: number): Observable<Alumno> {
    return this.httpClient.put<Alumno>(`${this.baseURL}/alumnos/${id}/estado`, {});
  }

  // Obtener solo alumnos activos
  obtenerAlumnosActivos(): Observable<Alumno[]> {
    return this.httpClient.get<Alumno[]>(`${this.baseURL}/alumnos/activos`);
  }

}
