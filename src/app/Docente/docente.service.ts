import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Docente } from './docente';
import { Anexo } from './anexo';
import { AnexoDTO } from './anexo-dto';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  //obtiene listado de docentes de backend
  private baseURL = "http://localhost:8080/expedienteDocente/docentes"

  constructor(private httpClient : HttpClient) {
   }
  
  //obtiene todos los docentes
  obtenerListaDocentes():Observable<Docente[]>{
    return this.httpClient.get<Docente[]>(`${this.baseURL}`);
  }
  obtenerDocentePorDui(duiDocente: string): Observable<Docente> {
    return this.httpClient.get<Docente>(`${this.baseURL}/${duiDocente}`);
  }

  //envia y guarda docente
  guardarDocente(docente : Docente) : Observable<Docente>{
    return this.httpClient.post<Docente>(`${this.baseURL}`,docente);
  }
  agregarAnexo(duiDocente: string, anexo: Anexo): Observable<Anexo> {
    return this.httpClient.post<Anexo>(`http://localhost:8080/anexos/docente/${duiDocente}`, anexo);
  }
  actualizarDocente(duiDocente: string,docente:Docente):Observable<Docente>{
    const url = `${this.baseURL}/${duiDocente}`;
    return this.httpClient.put<Docente>(url,docente);
  }
  // obtener anexos del docente
  obtenerAnexosPorDocente(duiDocente: string): Observable<AnexoDTO[]> {
    return this.httpClient.get<AnexoDTO[]>(`http://localhost:8080/anexos/docente/${duiDocente}`);
  }
  // eliminar anexo
  eliminarAnexo(id: number): Observable<void> {
    return this.httpClient.delete<void>(`http://localhost:8080/anexos/${id}`);
  }
}
