import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BloqueService {
  private baseURL = "http://localhost:8080/asignarDocenteAMateria";

  constructor(private httpClient: HttpClient) { }

  obtenerTodosBloques(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseURL}/bloques`);
  }
}