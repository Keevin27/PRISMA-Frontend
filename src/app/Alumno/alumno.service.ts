import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Alumno } from './alumno';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private baseURL = "http://localhost:8080/Alu/alumnos"
  
    constructor(private httpClient :HttpClient) { }
  
    obtenerListaDeAlumnos():Observable<Alumno[]>{
      return this.httpClient.get<Alumno[]>(`${this.baseURL}`);
    }
    obtenerListaDeAlumnosPorGrado(grado:string):Observable<Alumno[]>{
      return this.httpClient.get<Alumno[]>(`${this.baseURL}/${grado}`);
    }
}
