import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaqueteEscolar } from './paquete-escolar';

@Injectable({
  providedIn: 'root'
})
export class PaqueteEscolarService {

  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/PaqEsc/paquetes-escolares"

  constructor(private httpClient :HttpClient) { }

  obtenerListaDePaquetes():Observable<PaqueteEscolar[]>{
    return this.httpClient.get<PaqueteEscolar[]>(`${this.baseURL}`);
  }
  obtenerListaDePaquetesActivos():Observable<PaqueteEscolar[]>{
    return this.httpClient.get<PaqueteEscolar[]>(`${this.baseURL}-activos`);
  }
  agregarPaquete(paqueteescolar:PaqueteEscolar):Observable<Object>{
    return this.httpClient.post(`${this.baseURL}`,paqueteescolar)
  }
  actualizarPaquete(id:number, paquete: PaqueteEscolar):Observable<Object> {
  return this.httpClient.put(`${this.baseURL}/${id}`, paquete);
}
}
