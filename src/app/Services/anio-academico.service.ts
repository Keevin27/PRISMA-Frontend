import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnioAcademico } from '../Models/anio-academico';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnioAcademicoService {

  private baseURL = "http://localhost:8080/AnioAcademico/"

  constructor(private httpClient:HttpClient) { }

  obtenerAniosAcademicos(): Observable<AnioAcademico[]>{
      return this.httpClient.get<AnioAcademico[]>(`${this.baseURL}`)
    }
  
}
