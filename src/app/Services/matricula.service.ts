import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Matricula } from '../Models/matricula';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {

  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/Matricula"
  constructor(private httpClient: HttpClient) { }

  // Obtener todas las matriculas
  obtenerMatriculas(): Observable<Matricula[]> {
    return this.httpClient.get<Matricula[]>(`${this.baseURL}/`);
  }
  //Busca matricula con el Id de un alumno
  findMatriculaByIdAlumno(idAlumno:number): Observable<Matricula>{
    return this.httpClient.get<Matricula>(`${this.baseURL}/buscarAlumno/${idAlumno}`)
  }
}
