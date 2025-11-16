import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dia } from '../Models/dia';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiaService {

  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/Dia"
  
    constructor(private httpClient: HttpClient) { }
  
    obtenerDias(): Observable<Dia[]> {
      return this.httpClient.get<Dia[]>(`${this.baseURL}/`);
    }
}
