import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Alumnopaquete } from './alumnopaquete';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlumnopaqueteService {

  private baseURL = "http://localhost:8080/AluPaq/alumnos-paquetes"

  constructor(private httpClient:HttpClient) { }

  agregarAlumnoPaquete(alumnopaquete:Alumnopaquete):Observable<Object>{
      return this.httpClient.post(`${this.baseURL}`,alumnopaquete)
    }
  
  obtenerAsignacionesDePaquetes(idgrado:string):Observable<Alumnopaquete[]>{
    return this.httpClient.get<Alumnopaquete[]>(`${this.baseURL}-filtro-grado/${idgrado}`)
  }
}
