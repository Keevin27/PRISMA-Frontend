import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Docente } from './docente';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  //obtiene listado de docentes de backend
  private baseURL = "http://localhost:8080/expedienteDocente/docentes/"

  constructor(private httpClient : HttpClient) { }
  
  //obtiene todos los docentes
  obtenerListaDocentes():Observable<Docente[]>{
    return this.httpClient.get<Docente[]>(`${this.baseURL}`);
  }
}
