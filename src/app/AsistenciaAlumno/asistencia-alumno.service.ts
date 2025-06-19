import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AsistenciaAlumno } from './asistencia-alumno';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaAlumnoService {

   private baseURL = "http://localhost:8080/AsisAlum/asistencia-alumno"
  
    constructor(private httpClient :HttpClient) { }

    obtenerAsistenciaAlumnos(): Observable<AsistenciaAlumno[]>{
      return this.httpClient.get<AsistenciaAlumno[]>(this.baseURL);
    }
  
}
