import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Matricula } from '../Models/matricula';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private baseURL = "http://localhost:8080/Matricula";

  constructor(private httpClient: HttpClient) { }

  // Obtener todas las matrículas
  obtenerMatriculas(): Observable<Matricula[]> {
    return this.httpClient.get<Matricula[]>(`${this.baseURL}/`);
  }

  // Obtener matrículas por año
  obtenerMatriculasPorAnio(anio: number): Observable<Matricula[]> {
    return this.httpClient.get<Matricula[]>(`${this.baseURL}/${anio}`);
  }

  // Obtener matrículas por grado
  obtenerMatriculasPorGrado(idGrado: number): Observable<Matricula[]> {
    return this.httpClient.get<Matricula[]>(`${this.baseURL}/grado/${idGrado}`);
  }

  // Buscar matrícula por ID de alumno
  obtenerMatriculaPorIdAlumno(idAlumno: number): Observable<Matricula> {
    return this.httpClient.get<Matricula>(`${this.baseURL}/buscarAlumno/${idAlumno}`);
  }

  // Crear nueva matrícula
  crearMatricula(payload: { idAlumno: number; idGrado: number }): Observable<Matricula> {
    return this.httpClient.post<Matricula>(`${this.baseURL}/crear`, payload);
  }

  // Actualizar matrícula existente
  actualizarMatricula(id: number, matricula: Matricula): Observable<Matricula> {
    return this.httpClient.put<Matricula>(`${this.baseURL}/${id}`, matricula);
  }

  // Eliminar matrícula
  eliminarMatricula(id: number): Observable<string> {
    return this.httpClient.delete(`${this.baseURL}/${id}`, { responseType: 'text' });
  }

  // Verificar si un alumno ya está matriculado en un año específico
  verificarMatriculaExistente(idAlumno: number, anio: number): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.baseURL}/verificar/${idAlumno}/${anio}`);
  }

  // Contar alumnos matriculados en un grado
  contarAlumnosPorGrado(idGrado: number): Observable<number> {
    return this.httpClient.get<number>(`${this.baseURL}/contar/${idGrado}`);
  }
}