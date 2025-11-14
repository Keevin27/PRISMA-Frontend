import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnioAcademico } from '../Models/anio-academico';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnioAcademicoService {

  private baseURL = "http://localhost:8080/AnioAcademico/"

  constructor(private httpClient: HttpClient) { }

  obtenerAniosAcademicos(): Observable<AnioAcademico[]> {
    return this.httpClient.get<AnioAcademico[]>(`${this.baseURL}`)
  }

  obtenerAnioAcademicoPorId(id: number): Observable<AnioAcademico> {
    return this.httpClient.get<AnioAcademico>(`${this.baseURL}${id}`)
  }

  crearAnioAcademico(anio: number): Observable<AnioAcademico> {
    return this.httpClient.post<AnioAcademico>(`${this.baseURL}crear`, { anio })
  }

  actualizarEstado(id: number, estados: { anio_activo?: boolean, anio_cerrado?: boolean }): Observable<AnioAcademico> {
    return this.httpClient.put<AnioAcademico>(`${this.baseURL}actualizar-estado/${id}`, estados)
  }
}