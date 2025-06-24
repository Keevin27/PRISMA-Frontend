import { HttpClient, HttpResponse } from '@angular/common/http';
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
  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/expedienteDocente/docentes"
  private baseAnexURL ="https://prisma-backend-9dd71ec0c985.herokuapp.com/anexos/docente"

  constructor(private httpClient : HttpClient) {
   }
  
  //obtiene todos los docentes
  obtenerListaDocentes():Observable<Docente[]>{
    return this.httpClient.get<Docente[]>(`${this.baseURL}`);
  }
  //obtiene eldocente a partir del DUI
  obtenerDocentePorDui(duiDocente: string): Observable<Docente> {
    return this.httpClient.get<Docente>(`${this.baseURL}/${duiDocente}`);
  }
  //verifica que al insertar no exista ese docente
  existeDocente(dui: string): Observable<boolean> {
    const url = `${this.baseURL}/existe/${dui}`;
    return this.httpClient.get<boolean>(url);
  }

  //envia y guarda docente
  guardarDocente(docente : Docente) : Observable<Docente>{
    return this.httpClient.post<Docente>(`${this.baseURL}`,docente);
  }
  agregarAnexo(duiDocente: string, anexo: Anexo): Observable<Anexo> {
    const url = `${this.baseAnexURL}/${duiDocente}`;
    return this.httpClient.post<Anexo>(url, anexo);
  }
  //actualizar los datos del docente
  actualizarDocente(duiDocente: string,docente:Docente):Observable<Docente>{
    const url = `${this.baseURL}/${duiDocente}`;
    return this.httpClient.put<Docente>(url,docente);
  }
  //eliminarDocente
  actualizarEstadoDocente(duiDocente: string, estado: boolean): Observable<void> {
    const url = `${this.baseURL}/${duiDocente}/estado`;
    return this.httpClient.put<void>(url, { docente_Activo: estado });
  }
  //Imprimir todos los docentes activos
  imprimirTodosLosDocentes(): Observable<Blob> {
    const url = `${this.baseURL}/imprimirTodos`;
    return this.httpClient.get(url, {
      responseType: 'blob'  // importante para manejar archivos binarios
    });
  }
  //imprimir solo el docente seleccionado
  imprimirExpedienteDocente(duiDocente: string): Observable<Blob> {
    const url = `${this.baseURL}/${duiDocente}/imprimir`;
    return this.httpClient.get(url, {
      responseType: 'blob'
    });
  }

  // obtener anexos del docente
  obtenerAnexosPorDocente(duiDocente: string): Observable<AnexoDTO[]> {
    const url = `${this.baseAnexURL}/${duiDocente}/archivos`;
    return this.httpClient.get<AnexoDTO[]>(url);
  }
  // eliminar anexo
  eliminarAnexo(id: number): Observable<void> {
    const url = `${this.baseAnexURL}/${id}`;
    return this.httpClient.delete<void>(url);
  }
  //Descargar el anexo
  descargarAnexo(id: number): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(`${this.baseAnexURL}/${id}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
