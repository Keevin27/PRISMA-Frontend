import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dia } from '../Models/dia';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiaService {

  private baseURL = "http://localhost:8080/Dia"
  
    constructor(private httpClient: HttpClient) { }
  
    obtenerDias(): Observable<Dia[]> {
      return this.httpClient.get<Dia[]>(`${this.baseURL}/`);
    }
}
