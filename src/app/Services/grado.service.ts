import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Grado } from '../Models/grado';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GradoService {
  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/Grado/grados"

  constructor(private httpClient:HttpClient) { }

  obtenerGradosPorAnyo(anyo:number): Observable<Grado[]>{
    return this.httpClient.get<Grado[]>(`${this.baseURL}/${anyo}`)
  }

}
