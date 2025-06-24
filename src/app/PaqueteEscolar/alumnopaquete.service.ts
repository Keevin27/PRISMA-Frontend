import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Alumnopaquete } from './alumnopaquete';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlumnopaqueteService {

  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/AluPaq/alumnos-paquetes"

  constructor(private httpClient:HttpClient) { }

  agregarAlumnoPaquete(alumnopaquete:Alumnopaquete):Observable<Object>{
      return this.httpClient.post(`${this.baseURL}`,alumnopaquete)
    }
  
  obtenerAsignacionesDePaquetes(idgrado:string):Observable<Alumnopaquete[]>{
    return this.httpClient.get<Alumnopaquete[]>(`${this.baseURL}-filtro-grado/${idgrado}`)
  }
  actualizarAlumnoPaquete(id:number, alupaq: Alumnopaquete):Observable<Object>{
    return this.httpClient.put(`${this.baseURL}/${id}`, alupaq);
  }
}
